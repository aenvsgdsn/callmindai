import argparse
from app.db.database import Base, engine, SessionLocal
from app.db import models


def create_schema():
    Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        agency = models.Agency(name="Seed Agency")
        db.add(agency)
        db.commit()
        db.refresh(agency)

        user = models.User(
            agency_id=agency.id,
            name="Seed Admin",
            email="admin@seed.test",
            role="agency_admin",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print("Seeded agency:", agency.id)
        print("Seeded user:", user.id)
    finally:
        db.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--create-schema', action='store_true')
    args = parser.parse_args()

    if args.create_schema:
        create_schema()
    seed()
