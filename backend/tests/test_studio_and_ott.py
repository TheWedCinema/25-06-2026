"""Backend tests for Studio OS + Wedding OTT (iteration 3)."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].splitlines()[0].strip()
BASE_URL = BASE_URL.rstrip("/")


# ---------- Studio Stats ----------
class TestStudioStats:
    def test_studio_stats_shape(self):
        r = requests.get(f"{BASE_URL}/api/studio/stats", timeout=15)
        assert r.status_code == 200
        d = r.json()
        # studio
        assert d["studio"]["name"] == "Lumiere Films"
        assert d["studio"]["initials"] == "LF."
        # storage
        s = d["storage"]
        assert s["used_gb"] == 432
        assert s["total_gb"] == 1024
        assert s["egress_gb"] == 128.4
        assert s["monthly_cost_inr"] == 214.20
        # engagement
        e = d["engagement"]
        assert e["tv_views_pct"] == 42
        assert e["mobile_views_pct"] == 58
        assert e["replay_rate_pct"] == 94
        # jobs
        assert len(d["jobs"]["active"]) == 2
        targets = [t["res"] for t in d["jobs"]["hls_targets"]]
        assert targets == ["240p", "480p", "720p", "1080p", "2K HD", "4K UHD"]
        # uploads + deliverables
        assert len(d["pending_guest_uploads"]) == 3
        assert len(d["deliverable_types"]) == 7


# ---------- Wedding meta ----------
class TestWeddingMeta:
    def test_meta_after_refactor(self):
        r = requests.get(f"{BASE_URL}/api/weddings/aanya-vikram/meta", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["row_count"] == 3
        assert d["studio_initials"] == "LF."
        assert d["couple"] == "Aanya & Vikram"
        # no video URLs leaked pre-unlock
        assert "trailer_url" not in d
        assert "rows" not in d

    def test_meta_404(self):
        r = requests.get(f"{BASE_URL}/api/weddings/nope/meta", timeout=10)
        assert r.status_code == 404


# ---------- Wedding unlock ----------
class TestWeddingUnlock:
    def test_unlock_with_correct_pin(self):
        r = requests.post(f"{BASE_URL}/api/weddings/aanya-vikram/unlock",
                          json={"pin": "1234"}, timeout=10)
        assert r.status_code == 200
        d = r.json()
        # profiles
        assert len(d["profiles"]) == 3
        ids = [p["id"] for p in d["profiles"]]
        assert set(ids) == {"couple", "family", "guest"}
        # rows
        assert len(d["rows"]) == 3
        rows = {r["id"]: r for r in d["rows"]}
        assert len(rows["masterpieces"]["items"]) == 3
        assert len(rows["archives"]["items"]) == 4
        assert len(rows["reels"]["items"]) == 3
        assert rows["reels"].get("share")
        # photos
        assert len(d["photos"]) == 9
        # trailer url present
        assert d["trailer_url"].startswith("http")

    def test_unlock_with_wrong_pin(self):
        r = requests.post(f"{BASE_URL}/api/weddings/aanya-vikram/unlock",
                          json={"pin": "0000"}, timeout=10)
        assert r.status_code == 401


# ---------- Founders regression ----------
class TestFoundersRegression:
    def test_stats(self):
        r = requests.get(f"{BASE_URL}/api/founders/stats", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["total_spots"] == 100
        assert d["claimed"] + d["remaining"] == 100

    def test_apply_validation(self):
        r = requests.post(f"{BASE_URL}/api/founders/apply", json={}, timeout=10)
        assert r.status_code == 422
