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


# ---------- Public Wedding OTT (demo) ----------
DEMO_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
TRAILER_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

WEDDINGS = {
    "aanya-vikram": {
        "slug": "aanya-vikram",
        "couple": "Aanya & Vikram",
        "date": "14 February 2026",
        "venue": "Umaid Bhawan Palace, Jodhpur",
        "studio": "Lumiere Films",
        "studio_initials": "LF.",
        "studio_tagline": "Premier Cinematography",
        "poster_tagline": "A Cinematic Wedding Story",
        "poster_image": "https://images.pexels.com/photos/34172822/pexels-photo-34172822.jpeg",
        "logline": "Experience the royal destination wedding. A masterfully crafted cinematic documentary highlighting the magic, love, and traditions across five days under the Rajasthan sun.",
        "pin": "1234",
        "trailer_url": TRAILER_VIDEO,
        "profiles": [
            {"id": "couple",  "name": "Aanya & Vikram", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", "role": "owners"},
            {"id": "family",  "name": "Family",         "avatar": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=200&q=80", "role": "viewer"},
            {"id": "guest",   "name": "Guest",          "avatar": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=200&q=80", "role": "viewer"},
        ],
        "rows": [
            {
                "id": "masterpieces",
                "title": "The Cinematic Masterpieces",
                "items": [
                    {"id": "sde",        "title": "Same Day Edit (SDE)",  "duration": "05:12", "synopsis": "Instant wedding day highlight.",     "thumb": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80", "url": DEMO_VIDEO},
                    {"id": "wedfilm",    "title": "The Wedding Film",      "duration": "28:40", "synopsis": "Cinematic documentary mastercut.",   "thumb": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80", "url": DEMO_VIDEO},
                    {"id": "highlights", "title": "Wedding Highlights",    "duration": "08:15", "synopsis": "The best moments combined.",        "thumb": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80", "url": DEMO_VIDEO},
                ],
            },
            {
                "id": "archives",
                "title": "Complete Event Archives",
                "items": [
                    {"id": "haldi",   "title": "Full Video: Haldi",   "duration": "45:30",   "synopsis": "Morning traditions and colors.",       "thumb": "https://images.unsplash.com/photo-1525135850648-b42365991054?auto=format&fit=crop&w=900&q=80", "url": DEMO_VIDEO},
                    {"id": "mehandi", "title": "Full Video: Mehandi", "duration": "38:20",   "synopsis": "Mehandi application and laughter.",    "thumb": "https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?auto=format&fit=crop&w=900&q=80", "url": DEMO_VIDEO},
                    {"id": "sangeet", "title": "Full Video: Sangeet", "duration": "1:15:00", "synopsis": "Performances and family dances.",       "thumb": "https://images.unsplash.com/photo-1514178703120-3fa66528901d?auto=format&fit=crop&w=900&q=80", "url": DEMO_VIDEO},
                    {"id": "ceremony","title": "Full Video: Ceremony","duration": "1:48:22", "synopsis": "The seven vows beneath the fire.",      "thumb": "https://images.unsplash.com/photo-1530082625928-db66d39c5a21?auto=format&fit=crop&w=900&q=80", "url": DEMO_VIDEO},
                ],
            },
            {
                "id": "reels",
                "title": "Social Media Cuts & Reels",
                "share": True,
                "items": [
                    {"id": "bridal",   "title": "Bridal Entry Magic", "duration": "00:28", "synopsis": "9:16 vertical · ready for Reels.",   "thumb": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80", "url": DEMO_VIDEO},
                    {"id": "haldimad", "title": "Haldi Madness",      "duration": "00:31", "synopsis": "9:16 vertical · ready for Reels.",   "thumb": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80", "url": DEMO_VIDEO},
                    {"id": "couple",   "title": "Couple Goals",       "duration": "00:24", "synopsis": "9:16 vertical · ready for Reels.",   "thumb": "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=600&q=80", "url": DEMO_VIDEO},
                ],
            },
        ],
        "photos": [
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80",
            "https://images.unsplash.com/photo-1525135850648-b42365991054?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1514178703120-3fa66528901d?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1530082625928-db66d39c5a21?auto=format&fit=crop&w=900&q=80",
        ],
    }
}


def _public_wedding(w):
    return {
        "slug": w["slug"],
        "couple": w["couple"],
        "date": w["date"],
        "venue": w["venue"],
        "studio": w["studio"],
        "studio_initials": w["studio_initials"],
        "studio_tagline": w["studio_tagline"],
        "poster_tagline": w["poster_tagline"],
        "poster_image": w["poster_image"],
        "logline": w["logline"],
        "trailer_url": w["trailer_url"],
        "profiles": w["profiles"],
        "rows": w["rows"],
        "photos": w["photos"],
    }


class PinVerifyRequest(BaseModel):
    pin: str


@api_router.get("/weddings/{slug}/meta")
async def wedding_meta(slug: str):
    w = WEDDINGS.get(slug)
    if not w:
        raise HTTPException(status_code=404, detail="Wedding not found")
    # Return only the metadata needed BEFORE PIN entry (no video URLs)
    return {
        "slug": w["slug"],
        "couple": w["couple"],
        "date": w["date"],
        "venue": w["venue"],
        "studio": w["studio"],
        "studio_initials": w["studio_initials"],
        "poster_tagline": w["poster_tagline"],
        "poster_image": w["poster_image"],
        "logline": w["logline"],
        "row_count": len(w["rows"]),
    }


@api_router.post("/weddings/{slug}/unlock")
async def wedding_unlock(slug: str, body: PinVerifyRequest):
    w = WEDDINGS.get(slug)
    if not w:
        raise HTTPException(status_code=404, detail="Wedding not found")
    if body.pin.strip() != w["pin"]:
        raise HTTPException(status_code=401, detail="Incorrect PIN. Please check the link your photographer sent.")
    return _public_wedding(w)


# Back-compat: keep legacy /api/episodes/demo
@api_router.get("/episodes/demo")
async def demo_episodes():
    w = WEDDINGS["aanya-vikram"]
    archive_row = next(r for r in w["rows"] if r["id"] == "archives")
    return {
        "wedding": {"couple": w["couple"], "date": w["date"], "poster_tagline": w["poster_tagline"]},
        "episodes": [{"id": e["id"], "title": e["title"], "duration": e["duration"], "thumb": e["thumb"]} for e in archive_row["items"][:4]],
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
