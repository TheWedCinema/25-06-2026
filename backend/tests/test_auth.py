"""Tests for Emergent Google Auth endpoints: /api/auth/{session,me,logout}.
Also includes regression checks for founders/weddings/studio endpoints.
"""
import os
import time
import uuid
from datetime import datetime, timedelta, timezone

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://ai-gallery-build.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    yield client[DB_NAME]
    client.close()


@pytest.fixture
def seeded_user(mongo_db):
    """Seed a photographer + valid session in Mongo and yield (token, user_id, email)."""
    user_id = f"test-user-{uuid.uuid4().hex[:10]}"
    email = f"test.photographer.{int(time.time())}@example.com"
    token = f"test_session_{uuid.uuid4().hex}"

    mongo_db.photographers.insert_one({
        "user_id": user_id,
        "email": email,
        "name": "Test Photographer",
        "picture": "https://via.placeholder.com/150",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    mongo_db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    yield {"token": token, "user_id": user_id, "email": email}
    # teardown
    mongo_db.user_sessions.delete_many({"user_id": user_id})
    mongo_db.photographers.delete_many({"user_id": user_id})


@pytest.fixture
def expired_user(mongo_db):
    user_id = f"test-user-exp-{uuid.uuid4().hex[:10]}"
    email = f"test.expired.{int(time.time())}@example.com"
    token = f"test_session_exp_{uuid.uuid4().hex}"

    mongo_db.photographers.insert_one({
        "user_id": user_id,
        "email": email,
        "name": "Expired User",
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    mongo_db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        # expired 1 hour ago
        "expires_at": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    yield {"token": token, "user_id": user_id}
    mongo_db.user_sessions.delete_many({"user_id": user_id})
    mongo_db.photographers.delete_many({"user_id": user_id})


# ---------- /api/auth/me ----------
class TestAuthMe:
    def test_me_unauthenticated_returns_401(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401
        assert r.json().get("detail") == "Not authenticated"

    def test_me_with_bearer_token(self, seeded_user):
        r = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": f"Bearer {seeded_user['token']}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user_id"] == seeded_user["user_id"]
        assert data["email"] == seeded_user["email"]
        assert data["name"] == "Test Photographer"
        assert "picture" in data

    def test_me_with_cookie(self, seeded_user):
        r = requests.get(
            f"{API}/auth/me",
            cookies={"session_token": seeded_user["token"]},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user_id"] == seeded_user["user_id"]
        assert data["email"] == seeded_user["email"]

    def test_me_with_invalid_token(self):
        r = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": "Bearer this-token-does-not-exist"},
        )
        assert r.status_code == 401
        assert r.json().get("detail") == "Not authenticated"

    def test_me_with_expired_token(self, expired_user):
        r = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": f"Bearer {expired_user['token']}"},
        )
        assert r.status_code == 401


# ---------- /api/auth/session ----------
class TestAuthSession:
    def test_session_invalid_session_id(self):
        r = requests.post(
            f"{API}/auth/session",
            json={"session_id": "obviously-invalid-session-id-xyz"},
        )
        assert r.status_code == 401
        assert r.json().get("detail") == "Invalid or expired session_id"

    def test_session_missing_body_returns_422(self):
        r = requests.post(f"{API}/auth/session", json={})
        assert r.status_code == 422


# ---------- /api/auth/logout ----------
class TestAuthLogout:
    def test_logout_with_valid_token_invalidates_session(self, seeded_user):
        token = seeded_user["token"]
        # 1) confirm session works
        r = requests.get(
            f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}
        )
        assert r.status_code == 200
        # 2) logout
        r = requests.post(
            f"{API}/auth/logout", headers={"Authorization": f"Bearer {token}"}
        )
        assert r.status_code == 200
        assert r.json() == {"ok": True}
        # 3) confirm session is gone
        r = requests.get(
            f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"}
        )
        assert r.status_code == 401

    def test_logout_without_token_ok(self):
        # No token still returns ok:true (no-op)
        r = requests.post(f"{API}/auth/logout")
        assert r.status_code == 200
        assert r.json() == {"ok": True}


# ---------- Regression: existing public endpoints still work ----------
class TestRegression:
    def test_founders_stats(self):
        r = requests.get(f"{API}/founders/stats")
        assert r.status_code == 200
        d = r.json()
        assert d["total_spots"] == 100
        assert "claimed" in d and "remaining" in d
        assert d["claimed"] + d["remaining"] == 100

    def test_founders_apply_validation(self):
        # Missing required field -> 422
        r = requests.post(f"{API}/founders/apply", json={"full_name": "x"})
        assert r.status_code == 422

    def test_wedding_meta(self):
        r = requests.get(f"{API}/weddings/aanya-vikram/meta")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "aanya-vikram"
        assert d["row_count"] == 3
        # No leaks of video URLs in the meta payload
        assert "rows" not in d
        assert "trailer_url" not in d

    def test_wedding_unlock_correct_pin(self):
        r = requests.post(
            f"{API}/weddings/aanya-vikram/unlock", json={"pin": "1234"}
        )
        assert r.status_code == 200
        d = r.json()
        assert len(d["rows"]) == 3
        assert len(d["profiles"]) == 3
        assert len(d["photos"]) == 9

    def test_wedding_unlock_wrong_pin(self):
        r = requests.post(
            f"{API}/weddings/aanya-vikram/unlock", json={"pin": "0000"}
        )
        assert r.status_code == 401

    def test_studio_stats(self):
        r = requests.get(f"{API}/studio/stats")
        assert r.status_code == 200
        d = r.json()
        assert d["studio"]["name"] == "Lumiere Films"
        assert d["storage"]["used_gb"] == 432
        assert len(d["jobs"]["active"]) == 2
        assert len(d["jobs"]["hls_targets"]) == 6
