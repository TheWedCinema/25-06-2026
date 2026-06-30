# The Wed Cinema — Product Requirements Document

## Original Problem Statement
User shared a Python script (ReportLab) generating 3 PDFs for "The Wed Cinema" — India's first Wedding OTT Platform for wedding photographers/filmmakers — plus an Executive Summary describing a Netflix-style wedding delivery platform (4K films, AI face search, OTT player, one-click TV cast, photographer branding, founder program limited to 100 studios). User instructed: "Assume Default and Proceed" → "go" → shared GitHub URL (reference only) → shared rich HTML mockup ("Asraf Khan Studios" OTT experience) → "Autonomous CTO Mode: only update, improve and extend; do not remove."

## Vision & Founder Positioning
Replace hard-drives & WeTransfer in the wedding industry with a single cinematic, Netflix-style streaming link.
- Brand promise: *"Deliver weddings like Netflix."*
- Founder quote: *"I make photographers look like filmmakers and make wedding delivery feel like Netflix."*
- Brand strapline: *"Built by Wedding Filmmakers. Designed for Real Wedding Problems. Powered by The Wed Cinema™."*

## User Personas
- **Photographer / Studio Owner** — needs premium delivery, branding, upsells, analytics, transcode automation
- **High-end Couple (₹50L–5Cr wedding)** — expects cinematic delivery, easy TV viewing, social-ready reels
- **Family & Guest viewers** — want fast access to their photos & films, separate profiles
- **Founding Photographer** — applies for the limited 100-studio program

## Tech Stack
- **Frontend:** React 19 + react-router-dom 7 + Tailwind + framer-motion + lucide-react + axios
- **Backend:** FastAPI + Motor (async MongoDB) + Pydantic v2 (EmailStr)
- **Database:** MongoDB (collection: `founder_applications`); WEDDINGS + studio stats currently in-memory (mock for demo)
- **Design system:** Cormorant Garamond (serif headings) + Montserrat (body), pure-black / ivory / soft-gold #D4AF37, film-grain overlay, asymmetric editorial layout, framer-motion drift-ups

## Routes
- `/` — Marketing landing
- `/w/:slug` — Public Wedding OTT (PIN → Profile Select → Cinema/Photos)
- `/studio` — Studio Command Center (Video Delivery OS preview)

## Implemented Milestones

### Iteration 1 (Jun 2026) — Marketing MVP
- 3 source PDFs at `/app/generated_docs/` (Gemini Guide, Sales Blueprint, Marketing Roadmap)
- Cinematic landing — 10 sections (Hero, Trust Badges, Problem, Features Bento, How It Works, OTT mockup, TV Connect, Founders, Pricing, Final CTA, Footer)
- Founding-photographer lead-capture (modal + live "X of 100 spots" counter)
- Backend: `/api/founders/{stats,apply,applications}`, `/api/episodes/demo`
- Test: backend 100%, frontend 100% (iteration_1.json)

### Iteration 2 (Jun 2026) — Public OTT Player
- Route `/w/:slug` with PIN gate (1234) + cinematic hero + 4 episodes + share-copy
- Backend: `/api/weddings/{slug}/meta`, `/api/weddings/{slug}/unlock`
- Test: backend 100% (iteration_2.json)

### Iteration 3 (Jun 2026) — Rich OTT + Studio Command Center
- WeddingPlayer expanded: Profile Selector ("Who's watching?" — 3 profiles), Cinema/Photos tabs, 3 content rows (Masterpieces / Archives / Reels with Instagram-share), Photo Vault masonry (9 photos), Watch-on-TV modal with 6-digit code + Chromecast/AirPlay/Apple TV, player quality selector (Auto·4K / 2K HD / 1080p / 720p), Studio Card with Chat/Call, brand strapline footer
- NEW route `/studio` = Studio Command Center / Video Delivery OS:
  - **Ingest & Transcode** — category / deliverable / file-size dropdowns + meta + simulated TUS chunked upload progress + live FFmpeg monitor with 2 active jobs + 6 HLS target tiles (240p / 480p / 720p / 1080p / 2K HD / 4K UHD)
  - **Delivery Rules** — allow-downloads & auto-watermark toggles + pending guest-upload moderation queue (3 entries with Approve/Reject)
  - **Storage & Engagement** — Backblaze B2 stats (432 GB / 1 TB, 128.4 GB egress, ₹214.20 mo), engagement (TV 42% / Mobile 58% / Replay 94%)
- Landing: new Founder Quote section + Studio OS nav link + new strapline in footer
- Backend: `/api/studio/stats`
- Test: backend 100% (7/7 pytest), frontend 100% Playwright (iteration_3.json)

## Backlog

### P0 (next iteration)
- **Auth** — photographer login (JWT or Emergent Google Auth) — required for real Studio OS persistence
- **Persist Studio Rules** — PUT `/api/studio/rules`, MongoDB document per studio
- **Wire Approve/Reject** for pending guest uploads — backend route + state update
- **Studio OS — extract WeddingPlayer.jsx into /pages/wedding/* submodules** (file is approaching 500 lines)
- **Shared constants** — extract BRAND_STRAPLINE to `/constants/brand.js` (DRY)

### P1
- Real S3 multipart upload + FFmpeg HLS transcoding worker (currently simulated)
- AI Face Search worker (selfie → matching photos) — integrate via Gemini Vision or AWS Rekognition
- QR sharing + WhatsApp invite generator on the wedding link
- Pydantic response models for `/api/studio/stats` (schema contract)
- Email automation (SendGrid/Resend) — founder confirmation + new-lead notification

### P2
- Chromecast / AirPlay one-click cast SDK (currently UI-only)
- Photographer-side analytics dashboard (per-wedding views, watch-time, drop-off)
- Storefront / Stripe / Razorpay integration for upgrades (4K, albums, anniversary films)
- Admin moderation UI for founder applications
- Phone-as-remote (WebSocket) for cast-mode

## Mocked / Non-Persistent Surfaces (flagged for transparency)
- `WEDDINGS` dict — in-memory; not yet in MongoDB
- `/api/studio/stats` — mock data, no DB
- Studio OS Rules toggles — local state only (resets on reload)
- Approve/Reject buttons — no backend route yet
- Ingest "Start Chunk Upload (TUS)" — simulated progress only
- Guest Upload button on OTT page — no backend persistence
- Photo Vault "Download All" — not wired to a zip endpoint
- Cast buttons — UI only

## Test Coverage Summary
| Iteration | Backend | Frontend | Report |
|---|---|---|---|
| 1 | 100% | 100% | `iteration_1.json` |
| 2 | 100% | not tested | `iteration_2.json` |
| 3 | 100% | 100% | `iteration_3.json` |

## Next Tasks
1. Photographer authentication scaffold + login page
2. Persist Studio Rules + approve/reject backend routes
3. Refactor WeddingPlayer.jsx into modular files under `/pages/wedding/`
4. Wire SendGrid for founder confirmation emails
5. Integrate first real LLM call (Gemini Vision) for face-search MVP
