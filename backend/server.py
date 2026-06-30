from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="The Wed Cinema API")
api_router = APIRouter(prefix="/api")

# ---------- Founding Photographer Application ----------
FOUNDER_LIMIT = 100


class FounderApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    studio_name: str
    email: EmailStr
    city: str
    instagram: Optional[str] = None
    weddings_per_year: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FounderApplicationCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    studio_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    city: str = Field(min_length=2, max_length=120)
    instagram: Optional[str] = Field(default=None, max_length=120)
    weddings_per_year: Optional[str] = Field(default=None, max_length=60)
    message: Optional[str] = Field(default=None, max_length=1000)


class FounderStats(BaseModel):
    total_spots: int
    claimed: int
    remaining: int


@api_router.get("/")
async def root():
    return {"service": "The Wed Cinema", "status": "live"}


@api_router.get("/founders/stats", response_model=FounderStats)
async def founder_stats():
    claimed = await db.founder_applications.count_documents({})
    remaining = max(0, FOUNDER_LIMIT - claimed)
    return FounderStats(total_spots=FOUNDER_LIMIT, claimed=claimed, remaining=remaining)


@api_router.post("/founders/apply", response_model=FounderApplication)
async def apply_founder(payload: FounderApplicationCreate):
    claimed = await db.founder_applications.count_documents({})
    if claimed >= FOUNDER_LIMIT:
        raise HTTPException(status_code=409, detail="All 100 founding spots have been claimed.")

    existing = await db.founder_applications.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="An application with this email already exists.")

    app_obj = FounderApplication(**payload.model_dump())
    doc = app_obj.model_dump()
    doc['email'] = doc['email'].lower()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.founder_applications.insert_one(doc)
    return app_obj


@api_router.get("/founders/applications", response_model=List[FounderApplication])
async def list_applications(limit: int = 100):
    docs = await db.founder_applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    return docs


# ---------- Demo Episodes (OTT mock) ----------
@api_router.get("/episodes/demo")
async def demo_episodes():
    return {
        "wedding": {
            "couple": "Aanya & Vikram",
            "date": "2026-02-14",
            "poster_tagline": "A Cinematic Wedding Story",
        },
        "episodes": [
            {"id": "e1", "title": "Haldi", "duration": "08:42", "thumb": "https://images.unsplash.com/photo-1525135850648-b42365991054"},
            {"id": "e2", "title": "Mehndi", "duration": "12:18", "thumb": "https://images.unsplash.com/photo-1505932794465-147d1f1b2c97"},
            {"id": "e3", "title": "Sangeet", "duration": "15:04", "thumb": "https://images.unsplash.com/photo-1514178703120-3fa66528901d"},
            {"id": "e4", "title": "Ceremony", "duration": "22:51", "thumb": "https://images.unsplash.com/photo-1530082625928-db66d39c5a21"},
        ],
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
