import sys
import time
import os
import requests
import jwt

# Ensure project root is on sys.path so `import app` works when running this script
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.core.config import settings
from app.db.database import Base, engine, SessionLocal
from app.db import models


def create_schema():
    Base.metadata.create_all(bind=engine)


def seed_db():
    db = SessionLocal()
    try:
        agency = db.query(models.Agency).filter(models.Agency.name == "Seed Agency").first()
        if not agency:
            agency = models.Agency(name="Seed Agency")
            db.add(agency)
            db.commit()
            db.refresh(agency)

        user = db.query(models.User).filter(models.User.email == "seed@agency.test").first()
        if not user:
            user = models.User(
                agency_id=agency.id,
                name="Seed User",
                email="seed@agency.test",
                role="agency_admin"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return agency, user
    finally:
        db.close()


def make_jwt(user):
    payload = {
        "sub": user.id,
        "agency_id": user.agency_id,
        "role": user.role,
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def exercise_endpoints(token: str):
    base = "http://127.0.0.1:8000"
    headers = {"Authorization": f"Bearer {token}"}

    print("Creating lead via /leads ...")
    payload = {"name": "Test Lead", "phone": "+15551234567", "email": "lead@example.com"}
    r = requests.post(f"{base}/leads", json=payload, headers=headers, timeout=10)
    print("POST /leads ->", r.status_code, r.text)

    if r.status_code == 201:
        data = r.json()
        lead_id = data.get("id")
        print("Fetching created lead /leads/{id} ...")
        r2 = requests.get(f"{base}/leads/{lead_id}", headers=headers, timeout=10)
        print("GET /leads/{id} ->", r2.status_code, r2.text)


if __name__ == "__main__":
    print("Ensuring DB schema exists...")
    create_schema()
    print("Seeding DB with agency + user...")
    agency, user = seed_db()
    print(f"Seeded user: {user.email} (id={user.id})")
    token = make_jwt(user)
    print("JWT token (use as Bearer):", token)

    print("Waiting a moment to ensure server is up...")
    time.sleep(1)

    try:
        exercise_endpoints(token)
    except Exception as e:
        print("Error exercising endpoints:", e)
        sys.exit(2)
