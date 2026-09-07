"""
Seed script: creates the DB schema and populates it with realistic
sample data matching the former mock data in the Next.js frontend.

Usage:
    python scripts/seed_full.py

This will:
  - Create all tables
  - Create 1 Agency: "BanoQabil Real Estate"
  - Create 1 Admin user: admin@callmind.ai / admin123
  - Create 10 sample leads
  - Create 4 sample qualification strategies
  - Create 5 sample conversations
  - Create 7 sample appointments
"""
import sys
import os
import json
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import Base, engine, SessionLocal
from app.db import models


def hash_password(plain: str) -> str:
    try:
        from passlib.context import CryptContext
        ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return ctx.hash(plain)
    except Exception:
        return plain


def seed():
    print("Creating database schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(models.Agency).filter(
            models.Agency.name == "BanoQabil Real Estate"
        ).first()
        if existing:
            print("Database already seeded. Run with --reset to re-seed.")
            return

        print("Seeding agency...")
        agency = models.Agency(name="BanoQabil Real Estate")
        db.add(agency)
        db.commit()
        db.refresh(agency)

        print("Seeding users...")
        admin = models.User(
            agency_id=agency.id,
            name="Alex Johnson",
            email="admin@callmind.ai",
            password_hash=hash_password("admin123"),
            role="agency_admin",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        manager = models.User(
            agency_id=agency.id,
            name="Maria Lee",
            email="maria@callmind.ai",
            password_hash=hash_password("admin123"),
            role="sales_manager",
        )
        db.add(manager)
        db.commit()

        print("Seeding leads...")
        leads_data = [
            {"name": "Sarah Mitchell", "email": "sarah.m@luxerealty.com", "phone": "+15552041822", "status": "qualified", "source": "website", "intent": "buy"},
            {"name": "James Rodriguez", "email": "j.rodriguez@primeprop.co", "phone": "+15553109047", "status": "engaging", "source": "csv_import", "intent": "buy"},
            {"name": "Emily Watson", "email": "e.watson@homeview.io", "phone": "+15558183391", "status": "new", "source": "referral", "intent": "buy"},
            {"name": "Marcus Chen", "email": "m.chen@eastgatere.com", "phone": "+15556265512", "status": "reviewing", "source": "website", "intent": "invest"},
            {"name": "Olivia Taylor", "email": "o.taylor@greenfield.co", "phone": "+15553237714", "status": "human-required", "source": "cold_call", "intent": "buy"},
            {"name": "Daniel Kim", "email": "d.kim@westview.io", "phone": "+15552130092", "status": "qualified", "source": "website", "intent": "buy"},
            {"name": "Priya Sharma", "email": "p.sharma@horizonhomes.co", "phone": "+15554081176", "status": "engaging", "source": "referral", "intent": "buy"},
            {"name": "Robert Nguyen", "email": "r.nguyen@capitalre.com", "phone": "+15559492230", "status": "new", "source": "csv_import", "intent": "buy"},
            {"name": "Sofia Patel", "email": "s.patel@skylinere.com", "phone": "+15557028841", "status": "converted", "source": "website", "intent": "buy"},
            {"name": "Chris Wallace", "email": "c.wallace@premierprops.co", "phone": "+15555103345", "status": "human-required", "source": "cold_call", "intent": "buy"},
        ]

        lead_objs = []
        for i, ld in enumerate(leads_data):
            created = datetime.utcnow() - timedelta(days=i)
            lead = models.Lead(
                agency_id=agency.id,
                name=ld["name"],
                email=ld["email"],
                phone=ld["phone"],
                status=ld["status"],
                source=ld["source"],
                intent=ld["intent"],
                contact_eligibility=True,
                consent_status="opted_in",
                created_at=created,
            )
            db.add(lead)
            lead_objs.append(lead)
        db.commit()
        for l in lead_objs:
            db.refresh(l)

        print("Seeding qualification strategies...")
        strategies_data = [
            {
                "lead_idx": 2,  # Emily Watson
                "objective": "First-time buyer nurturing — Pasadena family homes",
                "questions": [
                    "What school districts are most important to you?",
                    "Do you have a pre-approval letter from a lender?",
                    "What is your target move-in timeline?",
                    "How many bedrooms and bathrooms do you need?",
                    "Is outdoor space (backyard/garden) a priority?",
                ],
                "status": "pending",
            },
            {
                "lead_idx": 3,  # Marcus Chen
                "objective": "Investment property qualification — Arcadia rental income focus",
                "questions": [
                    "What cap rate are you targeting?",
                    "Are you looking for short-term or long-term rental income?",
                    "Do you currently own other investment properties?",
                    "What is your preferred down payment percentage?",
                    "Are you open to off-market deals?",
                ],
                "status": "pending",
            },
            {
                "lead_idx": 7,  # Robert Nguyen
                "objective": "New construction condo education — Irvine",
                "questions": [
                    "Have you bought new construction before?",
                    "What is your expected completion timeline?",
                    "Are you aware of upgrade costs for new construction?",
                    "Have you been pre-approved for a mortgage?",
                ],
                "status": "approved",
            },
            {
                "lead_idx": 9,  # Chris Wallace
                "objective": "Cold lead re-engagement — Oakland affordable homes",
                "questions": [
                    "Is your current situation renting or owning?",
                    "What triggered your initial interest in buying?",
                    "What is your maximum monthly mortgage budget?",
                ],
                "status": "rejected",
            },
        ]

        strategy_objs = []
        for i, sd in enumerate(strategies_data):
            s = models.QualificationStrategy(
                lead_id=lead_objs[sd["lead_idx"]].id,
                objective=sd["objective"],
                questions=sd["questions"],
                status=sd["status"],
                approved_by=admin.id if sd["status"] in ("approved", "rejected") else None,
                created_at=datetime.utcnow() - timedelta(hours=i * 12),
            )
            db.add(s)
            strategy_objs.append(s)
        db.commit()

        print("Seeding conversations...")
        conversations_data = [
            {
                "lead_idx": 0,  # Sarah Mitchell
                "channel": "SMS",
                "status": "active",
                "sentiment": "positive",
                "ai_handled": True,
                "messages": [
                    {"from": "ai", "text": "Hi Sarah! I'm CallMind, your AI property advisor. I noticed you enquired about luxury condos in Beverly Hills. Can you tell me more about your ideal property?"},
                    {"from": "lead", "text": "Yes! I'm looking for a 3-bedroom with ocean views, ideally under $1.5M."},
                    {"from": "ai", "text": "Great! I've found 4 properties matching your criteria. They range from $1.1M—$1.45M. Shall I send you the full details?"},
                    {"from": "lead", "text": "Absolutely, please send them over."},
                    {"from": "ai", "text": "Sent! I've emailed you a curated list with photos and virtual tours. Which property caught your eye most?"},
                    {"from": "lead", "text": "The one on Wilshire looks stunning. Do you have more details?"},
                    {"from": "ai", "text": "Of course! 421 Wilshire Blvd #18 is a 3-bed/2-bath, 1,850sqft unit with panoramic ocean views. It was listed 3 days ago and has already had 6 showings."},
                    {"from": "lead", "text": "That sounds perfect! When can we schedule a viewing?"},
                ],
            },
            {
                "lead_idx": 1,  # James Rodriguez
                "channel": "Email",
                "status": "waiting",
                "sentiment": "neutral",
                "ai_handled": True,
                "messages": [
                    {"from": "ai", "text": "Hi James! Following up on your interest in beachfront properties in Malibu. We have 3 new listings you may love."},
                    {"from": "lead", "text": "Sounds interesting. What's the price range?"},
                    {"from": "ai", "text": "They range from $1.1M—$1.35M. All have private beach access and were updated within the last 2 years."},
                    {"from": "lead", "text": "I'll need to discuss with my partner first."},
                ],
            },
            {
                "lead_idx": 5,  # Daniel Kim
                "channel": "Voice",
                "status": "completed",
                "sentiment": "positive",
                "ai_handled": False,
                "messages": [
                    {"from": "ai", "text": "Hi Daniel! I'm reaching out about luxury properties in Santa Monica. Your search criteria indicate you're looking for something truly special."},
                    {"from": "lead", "text": "Yes, I want a penthouse or something very exclusive. Budget isn't really a concern."},
                    {"from": "ai", "text": "Wonderful! I have two exceptional properties — one is a 4,200sqft penthouse with private rooftop terrace, and another is a 5-bed oceanfront villa."},
                    {"from": "lead", "text": "The penthouse sounds incredible. Can we do a viewing?"},
                    {"from": "ai", "text": "Absolutely! Alex Johnson, our senior agent, will personally show you the property. Does August 28th at 2 PM work for you?"},
                    {"from": "lead", "text": "Perfect, I'll see you on the 28th at 2 PM."},
                ],
            },
            {
                "lead_idx": 4,  # Olivia Taylor
                "channel": "SMS",
                "status": "human-required",
                "sentiment": "negative",
                "ai_handled": True,
                "messages": [
                    {"from": "ai", "text": "Hi Olivia! I'm reaching out about starter homes in Culver City."},
                    {"from": "lead", "text": "How did you get my number?"},
                    {"from": "ai", "text": "You filled out a form on our website last week. I'm here to help you find your perfect home!"},
                    {"from": "lead", "text": "I'm not sure this AI thing is right for me..."},
                ],
            },
            {
                "lead_idx": 6,  # Priya Sharma
                "channel": "Email",
                "status": "active",
                "sentiment": "positive",
                "ai_handled": True,
                "messages": [
                    {"from": "ai", "text": "Hi Priya! You mentioned school districts are important. I've shortlisted 3 properties near top-rated elementary schools in Burbank."},
                    {"from": "lead", "text": "That's exactly what I need! Can you share the details?"},
                    {"from": "ai", "text": "Of course! I've sent the full details to your email. The Jefferson School district properties are particularly strong."},
                    {"from": "lead", "text": "Yes, the Burbank property near Jefferson Elementary looks ideal."},
                ],
            },
        ]

        for i, cd in enumerate(conversations_data):
            conv = models.Conversation(
                lead_id=lead_objs[cd["lead_idx"]].id,
                agency_id=agency.id,
                channel=cd["channel"],
                status=cd["status"],
                sentiment=cd["sentiment"],
                ai_handled=cd["ai_handled"],
                messages=cd["messages"],
                created_at=datetime.utcnow() - timedelta(hours=i * 3),
                updated_at=datetime.utcnow() - timedelta(minutes=i * 30),
            )
            db.add(conv)
        db.commit()

        print("Seeding appointments...")
        appointments_data = [
            {"lead_idx": 5, "date": "Aug 28, 2026", "time": "2:00 PM", "duration": "60 min", "type": "Property Viewing", "property": "421 Ocean Ave Penthouse, Santa Monica", "agent": "Alex Johnson", "status": "confirmed", "notes": "Client is VIP — bring premium brochure. Interested in rooftop access."},
            {"lead_idx": 0, "date": "Aug 29, 2026", "time": "10:30 AM", "duration": "45 min", "type": "Property Viewing", "property": "421 Wilshire Blvd #18, Beverly Hills", "agent": "Alex Johnson", "status": "confirmed", "notes": "Prefers morning appointments. Has 2 kids so family-friendly features matter."},
            {"lead_idx": 8, "date": "Aug 26, 2026", "time": "3:00 PM", "duration": "30 min", "type": "Contract Signing", "property": "88 Maple Drive, Glendale", "agent": "Alex Johnson", "status": "completed", "notes": "Contract signed. Commission: $21,250."},
            {"lead_idx": 1, "date": "Sep 02, 2026", "time": "11:00 AM", "duration": "60 min", "type": "Property Viewing", "property": "Zuma Beach Estates, Malibu", "agent": "Maria Lee", "status": "pending", "notes": "Partner Maya will also attend. Bring beach access documentation."},
            {"lead_idx": 6, "date": "Sep 03, 2026", "time": "9:00 AM", "duration": "45 min", "type": "Consultation", "property": "Office — 1800 Century Park E.", "agent": "Maria Lee", "status": "confirmed", "notes": "First meeting. Focus on school district options and financing."},
            {"lead_idx": 3, "date": "Sep 05, 2026", "time": "1:00 PM", "duration": "60 min", "type": "Investment Review", "property": "3 Investment Properties, Arcadia", "agent": "Alex Johnson", "status": "pending", "notes": "Prepare ROI analysis and rental income projections."},
            {"lead_idx": 2, "date": "Sep 08, 2026", "time": "11:30 AM", "duration": "45 min", "type": "Open House", "property": "TBD — Pasadena Weekend Open House", "agent": "Maria Lee", "status": "invited", "notes": "Group open house event. 8 families expected."},
        ]

        for ad in appointments_data:
            appt = models.Appointment(
                lead_id=lead_objs[ad["lead_idx"]].id,
                agency_id=agency.id,
                date=ad["date"],
                time=ad["time"],
                duration=ad["duration"],
                appointment_type=ad["type"],
                property_address=ad["property"],
                agent=ad["agent"],
                status=ad["status"],
                notes=ad["notes"],
            )
            db.add(appt)
        db.commit()

        print("\n✅ Seed complete!")
        print(f"   Agency ID  : {agency.id}")
        print(f"   Admin email: admin@callmind.ai")
        print(f"   Password   : admin123")
        print(f"   Leads      : {len(lead_objs)}")
        print(f"   Strategies : {len(strategy_objs)}")
        print(f"   Conv.      : {len(conversations_data)}")
        print(f"   Appts.     : {len(appointments_data)}")
        print("\nStart the backend with:")
        print("   uvicorn app.main:app --reload --port 8000")

    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Drop and recreate all tables")
    args = parser.parse_args()

    if args.reset:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("Tables dropped.")

    seed()
