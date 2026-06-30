# The Wed Cinema — Product Requirements Document

## Original Problem Statement
User shared a Python script (ReportLab) generating 3 PDFs for "The Wed Cinema" — India's first Wedding OTT Platform for wedding photographers/filmmakers — plus an Executive Summary describing a Netflix-style wedding delivery platform (4K films, AI face search, OTT player, one-click TV cast, photographer branding, founder program limited to 100 studios). User instructed: "Assume Default and Proceed" → "go".

## Vision
Replace hard-drives & WeTransfer in the wedding industry with a single cinematic, Netflix-style streaming link. Brand promise: *"Deliver weddings like Netflix."*

## User Personas
- **Photographer/Studio Owner** — wants premium delivery, branding, upsells, analytics
- **High-end Couple (₹50L–5Cr wedding)** — expects cinematic delivery, easy TV viewing
- **Wedding Guests/Family** — want fast access to their photos & films on any screen

## Tech Stack
- **Frontend:** React 19 + Tailwind + framer-motion + lucide-react + axios
- **Backend:** FastAPI + Motor (async MongoDB) + Pydantic v2 (EmailStr)
- **Database:** MongoDB (collection: `founder_applications`)
- **Design:** Cormorant Garamond (serif headings) + Montserrat (body), pure-black/ivory/gold luxury palette, film-grain overlay, framer-motion fade-ups, asymmetric editorial layout

## Implemented (Jun 2026)
- ✅ 3 source PDFs generated at `/app/generated_docs/` (Gemini Implementation Guide, Homepage Sales Blueprint, Marketing Roadmap)
- ✅ Cinematic landing page (single-route) — 10 sections:
  - Nav with sticky apply CTA, Hero (fullscreen cinematic image, dual CTAs, live spot counter),
  - Trust Badges row, Problem section ("Wedding delivery is broken"),
  - Features Bento Grid (8 cards, asymmetric span), How It Works (4 numbered steps),
  - OTT Episodes mockup (Haldi/Mehndi/Sangeet/Ceremony — Netflix-style hover dim siblings),
  - One-Click TV section, Founding Photographers exclusivity, Pricing (4 tiers, Studio highlighted gold),
  - Final CTA, Footer
- ✅ Founder Application capture: modal with editorial line-input style, backend persistence, duplicate-email guard, 100-spot cap with live counter
- ✅ Backend endpoints:
  - `GET /api/` — health
  - `GET /api/founders/stats` — {total_spots, claimed, remaining}
  - `POST /api/founders/apply` — create application (409 on duplicate / cap-reached, 422 on invalid)
  - `GET /api/founders/applications` — list (admin)
  - `GET /api/episodes/demo` — demo wedding + 4 episodes

## Test Coverage
- iteration_1: Backend 100% (8/8 endpoints), Frontend 100% (hero, counter, modal, apply→success, pricing tiers, no console errors)

## Backlog (P0/P1/P2)
- **P0** Authentication for photographers (JWT or Emergent Google Auth)
- **P0** Photographer Dashboard — create wedding project, set poster/trailer/PIN
- **P0** S3 multipart upload pipeline + FFmpeg HLS transcoding worker
- **P1** Public OTT player route `/w/:slug` with PIN gate + HLS playback (hls.js)
- **P1** AI Face Search worker (selfie → matching photos) — integrate via Gemini or AWS Rekognition
- **P1** QR sharing + WhatsApp invite generator
- **P2** Chromecast / AirPlay one-click cast SDK integration
- **P2** Photographer analytics dashboard (views, watch-time, drop-off, sales)
- **P2** Storefront / Stripe Razorpay integration for upgrades (4K, albums, anniversary films)
- **P2** Admin moderation UI for founder applications

## Next Actions
1. Wire SendGrid/Resend transactional email so founders get instant confirmation + the user gets a new-lead notification
2. Add photographer auth + dashboard scaffolding
3. Begin upload + transcoding pipeline (S3 + FFmpeg Lambda)
