from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER

styles = getSampleStyleSheet()

OUTPUT_DIR = "/app/generated_docs"

docs = {
    "Gemini_Implementation_Guide.pdf": [
        ("THE WED CINEMA - GEMINI IMPLEMENTATION GUIDE", True),
        ("Step 1: Give Gemini the complete project context and tell it to CONTINUE the existing project. Do not remove anything, only update and extend.", False),
        ("Step 2: Build modules in order: Homepage -> Authentication -> Photographer Dashboard -> Upload Engine -> AI Gallery -> OTT Player -> TV Connect -> Analytics -> Billing.", False),
        ("Step 3: Ask Gemini to generate production-ready Next.js + TypeScript + Tailwind code with APIs, database schema, and deployment scripts.", False),
        ("Step 4: Build and test each module separately, then integrate.", False),
        ("Step 5: Deploy frontend on Vercel and backend/media services on AWS (S3, CloudFront, PostgreSQL, Redis).", False),
        ("Step 6: Enable AI Face Search, adaptive streaming, and photographer branding.", False),
        ("Step 7: Create demo weddings and founder onboarding pages.", False),
    ],
    "Homepage_Sales_Blueprint.pdf": [
        ("THE WED CINEMA - HOMEPAGE SALES BLUEPRINT", True),
        ("Hero: Deliver Weddings Like Netflix.", False),
        ("Problem Section: Hard drives, pen drives, storage, 4K playback, multiple apps.", False),
        ("Solution Section: One platform for Photos, Videos, AI Galleries, OTT and TV Experience.", False),
        ("Feature Sections: AI Face Search, QR Sharing, Same Day Edit, OTT Streaming, Photographer Branding, Analytics, Security.", False),
        ("Trust Section: Built by wedding filmmakers for photographers.", False),
        ("Pricing Section: Starter, Professional, Studio, Enterprise and Pay-per-Wedding.", False),
        ("Final CTA: Stop Delivering Hard Drives. Start Delivering Experiences.", False),
    ],
    "Marketing_Roadmap.pdf": [
        ("THE WED CINEMA - MARKETING & LAUNCH ROADMAP", True),
        ("Phase 1: Build anticipation with Instagram Reels showing industry problems and solutions.", False),
        ("Phase 2: Launch Founding Photographer Program (100 studios only).", False),
        ("Phase 3: Weekly live demos and webinars for photographers.", False),
        ("Phase 4: Partnerships with photography educators, wedding planners and influencers.", False),
        ("Content Plan: 3 reels/week, 2 carousel posts/week, 1 long YouTube demo/week.", False),
        ("Target Audience: Wedding photographers, filmmakers, studio owners, destination wedding brands.", False),
        ("Personal Branding: Position yourself as the founder solving the industry's biggest delivery problem.", False),
    ]
}

paths = []
for filename, items in docs.items():
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/{filename}")
    story = []
    for text, heading in items:
        style = styles['Title'] if heading else styles['BodyText']
        story.append(Paragraph(text, style))
        story.append(Spacer(1, 12))
    doc.build(story)
    paths.append(f"{OUTPUT_DIR}/{filename}")

print(paths)
