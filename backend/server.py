from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="The Wed Cinema API")
api_router = APIRouter(prefix="/api")

# ---------- Emergent Google Auth ----------
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
SESSION_TTL_DAYS = 7
SESSION_COOKIE = "session_token"


class AuthSessionRequest(BaseModel):
    session_id: str


class AuthUser(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    role: str = "photographer"  # super_admin | photographer | client


# Bootstrap super-admin emails via env (comma-separated). First sign-in matching this list = super_admin.
SUPER_ADMIN_EMAILS = {
    e.strip().lower()
    for e in os.environ.get("SUPER_ADMIN_EMAILS", "test.photographer@example.com").split(",")
    if e.strip()
}


async def _get_authed_user(request: Request) -> Optional[dict]:
    """Read session_token from cookie OR Authorization header, validate, return user dict or None."""
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    user = await db.photographers.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if user and not user.get("role"):
        user["role"] = "photographer"
    return user


async def _require_role(request: Request, *allowed_roles: str) -> dict:
    user = await _get_authed_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.get("role") not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user


async def _audit(action: str, actor_id: str, target: Optional[str] = None, meta: Optional[dict] = None):
    await db.audit_log.insert_one({
        "id": f"audit_{uuid.uuid4().hex[:10]}",
        "action": action,
        "actor_id": actor_id,
        "target": target,
        "meta": meta or {},
        "ts": datetime.now(timezone.utc).isoformat(),
    })


@api_router.post("/auth/session")
async def auth_session(payload: AuthSessionRequest, response: Response):
    """Exchange a one-time session_id (from Emergent auth callback) for a persistent session."""
    async with httpx.AsyncClient(timeout=10.0) as http:
        try:
            r = await http.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": payload.session_id})
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="Unable to reach auth provider")
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired session_id")
    data = r.json()
    email = (data.get("email") or "").lower()
    name = data.get("name") or "Photographer"
    picture = data.get("picture")
    session_token = data.get("session_token")
    if not email or not session_token:
        raise HTTPException(status_code=502, detail="Malformed auth response")

    existing = await db.photographers.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.photographers.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture, "last_login_at": datetime.now(timezone.utc).isoformat()}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        # Pre-existing invite for this email → role=client and auto-link to invited weddings
        invite = await db.client_invites.find_one({"email": email, "status": "pending"}, {"_id": 0})
        if invite:
            role = "client"
        elif email in SUPER_ADMIN_EMAILS:
            role = "super_admin"
        else:
            role = "photographer"
        await db.photographers.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": role,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login_at": datetime.now(timezone.utc).isoformat(),
        })
        if invite:
            await db.client_invites.update_many(
                {"email": email, "status": "pending"},
                {"$set": {"status": "accepted", "user_id": user_id, "accepted_at": datetime.now(timezone.utc).isoformat()}},
            )
        await _audit("user.signup", user_id, target=email, meta={"role": role})

    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key=SESSION_COOKIE,
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
        path="/",
    )
    return {"user_id": user_id, "email": email, "name": name, "picture": picture, "role": (existing or {}).get("role") if existing else role}


@api_router.get("/auth/me", response_model=AuthUser)
async def auth_me(request: Request):
    user = await _get_authed_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return AuthUser(**user)


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie(key=SESSION_COOKIE, path="/", samesite="none", secure=True)
    return {"ok": True}


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


@api_router.get("/studio/stats")
async def studio_stats():
    """Mock dashboard data for the photographer admin / Studio OS preview."""
    return {
        "studio": {
            "name": "Lumiere Films",
            "initials": "LF.",
            "tagline": "Premier Cinematography",
        },
        "storage": {
            "label": "Backblaze B2 Vault",
            "used_gb": 432,
            "total_gb": 1024,
            "egress_gb": 128.4,
            "monthly_cost_inr": 214.20,
            "savings_note": "Savings vs S3",
        },
        "engagement": {
            "tv_views_pct": 42,
            "mobile_views_pct": 58,
            "replay_rate_pct": 94,
        },
        "jobs": {
            "active": [
                {"id": "j1", "filename": "Aanya-Vikram-SDE_master.mov", "size_gb": 5, "deliverable": "Same Day Edit",       "progress": 78, "phase": "HLS 1080p"},
                {"id": "j2", "filename": "Aanya-Vikram-Highlights.mov", "size_gb": 12, "deliverable": "Wedding Highlights", "progress": 42, "phase": "HLS 720p"},
            ],
            "hls_targets": [
                {"res": "240p",  "status": "done"},
                {"res": "480p",  "status": "done"},
                {"res": "720p",  "status": "running"},
                {"res": "1080p", "status": "pending"},
                {"res": "2K HD", "status": "pending"},
                {"res": "4K UHD","status": "pending"},
            ],
        },
        "rules": {
            "allow_client_downloads": True,
            "auto_watermark_low_bitrates": True,
        },
        "pending_guest_uploads": [
            {"id": "g1", "guest": "Riya Mehta",   "files": 12, "size_mb": 184, "submitted": "2 hours ago"},
            {"id": "g2", "guest": "Karan Bhatia", "files": 5,  "size_mb": 96,  "submitted": "5 hours ago"},
            {"id": "g3", "guest": "Nisha Iyer",   "files": 27, "size_mb": 412, "submitted": "1 day ago"},
        ],
        "deliverable_types": [
            "Same Day Edit (SDE)", "Wedding Highlight Film", "Full Wedding Film (4K Master)",
            "Traditional Video Part 1", "Pre Wedding Film", "Drone Film Master", "Family Film Edit",
        ],
        "categories": ["Premium Masterpiece (SDE, Highlights, etc.)", "Complete Event Archives (Haldi, Mehendi, Sangeet)"],
        "size_simulations": ["1 GB (Highlight Reel)", "5 GB (Drone master)", "10 GB (Full HD video)", "20 GB (4K Master)", "50 GB (Cinematic raw)"],
    }


# ---------- Super Admin (RBAC-gated) ----------
class ClientInviteRequest(BaseModel):
    email: EmailStr
    wedding_slug: str
    invited_by: Optional[str] = None


@api_router.get("/admin/overview")
async def admin_overview(request: Request):
    admin = await _require_role(request, "super_admin")
    total_users = await db.photographers.count_documents({})
    by_role = {}
    for role in ("super_admin", "photographer", "client"):
        by_role[role] = await db.photographers.count_documents({"role": role})
    return {
        "actor": {"email": admin["email"], "role": admin["role"]},
        "totals": {
            "users": total_users,
            "by_role": by_role,
            "founder_applications": await db.founder_applications.count_documents({}),
            "active_sessions": await db.user_sessions.count_documents({}),
            "weddings": len(WEDDINGS),
            "photo_categories": await db.photo_categories.count_documents({}),
            "client_invites": await db.client_invites.count_documents({}),
        },
    }


@api_router.get("/admin/users")
async def admin_users(request: Request, limit: int = 100):
    await _require_role(request, "super_admin")
    docs = await db.photographers.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return docs


@api_router.patch("/admin/users/{user_id}/role")
async def admin_set_role(user_id: str, body: dict, request: Request):
    admin = await _require_role(request, "super_admin")
    role = body.get("role")
    if role not in ("super_admin", "photographer", "client"):
        raise HTTPException(status_code=400, detail="Invalid role")
    r = await db.photographers.update_one({"user_id": user_id}, {"$set": {"role": role}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await _audit("user.role_change", admin["user_id"], target=user_id, meta={"new_role": role})
    return {"ok": True, "user_id": user_id, "role": role}


@api_router.get("/admin/audit")
async def admin_audit(request: Request, limit: int = 100):
    await _require_role(request, "super_admin")
    return await db.audit_log.find({}, {"_id": 0}).sort("ts", -1).to_list(limit)


# ---------- Client Invites ----------
@api_router.post("/invites")
async def create_invite(payload: ClientInviteRequest, request: Request):
    photog = await _require_role(request, "super_admin", "photographer")
    invite = {
        "id": f"inv_{uuid.uuid4().hex[:10]}",
        "email": payload.email.lower(),
        "wedding_slug": payload.wedding_slug,
        "invited_by": photog["user_id"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    # auto-link if invitee already exists
    existing = await db.photographers.find_one({"email": payload.email.lower()}, {"_id": 0})
    if existing:
        invite["status"] = "accepted"
        invite["user_id"] = existing["user_id"]
        invite["accepted_at"] = datetime.now(timezone.utc).isoformat()
        # demote to client role only if currently default photographer
        if existing.get("role") == "photographer":
            await db.photographers.update_one({"user_id": existing["user_id"]}, {"$set": {"role": "client"}})
    await db.client_invites.insert_one(dict(invite))
    await _audit("invite.create", photog["user_id"], target=payload.email, meta={"wedding": payload.wedding_slug})
    return invite


@api_router.get("/me/galleries")
async def my_galleries(request: Request):
    """Client-facing list of weddings they've been invited to."""
    user = await _get_authed_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    invites = await db.client_invites.find(
        {"email": user["email"], "status": "accepted"}, {"_id": 0}
    ).to_list(50)
    weddings = []
    for inv in invites:
        w = WEDDINGS.get(inv["wedding_slug"])
        if w:
            weddings.append({
                "slug": w["slug"],
                "couple": w["couple"],
                "date": w["date"],
                "venue": w["venue"],
                "poster_image": w["poster_image"],
                "studio": w["studio"],
            })
    return {"role": user.get("role"), "weddings": weddings}


# ---------- Photo Categories (GitHub-synced gallery library) ----------
@api_router.get("/photos/categories")
async def list_photo_categories(request: Request):
    """List the photographer's photo categories. Returns the seeded
    'The Wed Cinema Gallery' card for any logged-in studio."""
    user = await _get_authed_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = user["user_id"]
    cursor = db.photo_categories.find({"user_id": user_id}, {"_id": 0}).sort("created_at", 1)
    docs = await cursor.to_list(50)

    # Auto-seed the founding gallery on first visit
    if not docs:
        seed = {
            "id": f"cat_{uuid.uuid4().hex[:10]}",
            "user_id": user_id,
            "name": "The Wed Cinema Gallery",
            "slug": "the-wed-cinema-gallery",
            "source": "github",
            "github": {
                "owner": "TheWedCinema",
                "repo": "25-06-2026",
                "branch": "main",
                "path": "",
            },
            "cover_image": "https://images.pexels.com/photos/34172822/pexels-photo-34172822.jpeg",
            "tagline": "Master design library · auto-synced from GitHub",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.photo_categories.insert_one(dict(seed))
        docs = [seed]

    return docs


@api_router.get("/photos/categories/{cat_id}/sync")
async def sync_photo_category(cat_id: str, request: Request):
    """Live-fetch the file manifest from GitHub Contents API. Returns the latest
    items so the gallery stays in sync with the repo without manual refresh."""
    user = await _get_authed_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    cat = await db.photo_categories.find_one({"id": cat_id, "user_id": user["user_id"]}, {"_id": 0})
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if cat.get("source") != "github":
        return {"category": cat, "items": [], "synced_at": datetime.now(timezone.utc).isoformat()}

    gh = cat["github"]
    api_url = f"https://api.github.com/repos/{gh['owner']}/{gh['repo']}/contents/{gh['path']}?ref={gh['branch']}"
    async with httpx.AsyncClient(timeout=10.0) as http:
        try:
            r = await http.get(api_url, headers={"Accept": "application/vnd.github+json"})
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="Unable to reach GitHub")
    if r.status_code == 404:
        raise HTTPException(status_code=404, detail="GitHub repo/path not found")
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"GitHub error: {r.status_code}")

    items = []
    for entry in r.json():
        if entry.get("type") != "file":
            continue
        items.append({
            "name": entry["name"],
            "size_bytes": entry.get("size", 0),
            "download_url": entry.get("download_url"),
            "html_url": entry.get("html_url"),
            "sha": entry.get("sha"),
        })

    synced_at = datetime.now(timezone.utc).isoformat()
    await db.photo_categories.update_one(
        {"id": cat_id},
        {"$set": {"last_synced_at": synced_at, "item_count": len(items)}},
    )

    return {
        "category": {**cat, "last_synced_at": synced_at, "item_count": len(items)},
        "items": items,
        "synced_at": synced_at,
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
