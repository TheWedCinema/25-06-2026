"""Backend tests for Wed Cinema OTT player + founders regression."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ai-gallery-build.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Wedding meta ----------
class TestWeddingMeta:
    def test_meta_valid_slug(self, client):
        r = client.get(f"{API}/weddings/aanya-vikram/meta", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["slug", "couple", "date", "venue", "studio", "poster_image", "logline", "episode_count"]:
            assert k in d, f"missing {k}"
        assert d["slug"] == "aanya-vikram"
        assert d["couple"] == "Aanya & Vikram"
        assert d["episode_count"] == 4
        # meta should NOT include trailer/episodes URLs
        assert "trailer_url" not in d
        assert "episodes" not in d

    def test_meta_not_found(self, client):
        r = client.get(f"{API}/weddings/nonexistent/meta", timeout=15)
        assert r.status_code == 404
        assert r.json().get("detail") == "Wedding not found"


# ---------- Wedding unlock ----------
class TestWeddingUnlock:
    def test_unlock_wrong_pin(self, client):
        r = client.post(f"{API}/weddings/aanya-vikram/unlock", json={"pin": "0000"}, timeout=15)
        assert r.status_code == 401
        assert r.json().get("detail") == "Incorrect PIN. Please check the link your photographer sent."

    def test_unlock_correct_pin(self, client):
        r = client.post(f"{API}/weddings/aanya-vikram/unlock", json={"pin": "1234"}, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["couple"] == "Aanya & Vikram"
        assert "trailer_url" in d and d["trailer_url"].startswith("http")
        assert isinstance(d["episodes"], list) and len(d["episodes"]) == 4
        titles = [e["title"] for e in d["episodes"]]
        assert titles == ["Haldi", "Mehndi", "Sangeet", "Ceremony"]
        for e in d["episodes"]:
            for k in ["url", "thumb", "duration", "synopsis", "title", "id"]:
                assert k in e, f"episode missing {k}"

    def test_unlock_not_found(self, client):
        r = client.post(f"{API}/weddings/nonexistent/unlock", json={"pin": "1234"}, timeout=15)
        assert r.status_code == 404


# ---------- Regression: founders ----------
class TestFoundersRegression:
    def test_stats(self, client):
        r = client.get(f"{API}/founders/stats", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["total_spots"] == 100
        assert "claimed" in d and "remaining" in d
        assert d["claimed"] + d["remaining"] == 100

    def test_list_applications(self, client):
        r = client.get(f"{API}/founders/applications", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Back-compat: episodes/demo ----------
class TestEpisodesDemoBackCompat:
    def test_demo(self, client):
        r = client.get(f"{API}/episodes/demo", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "wedding" in d and "episodes" in d
        assert d["wedding"]["couple"] == "Aanya & Vikram"
        assert len(d["episodes"]) == 4
