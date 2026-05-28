import asyncio
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.domain import Event, Place, PlaceKind, Restaurant, User, UserRole


PLACES = [
    {
        "name": "Charminar",
        "slug": "charminar",
        "kind": PlaceKind.monument,
        "short_description": "Iconic 1591 monument surrounded by Laad Bazaar and food lanes.",
        "history": "Built by Muhammad Quli Qutb Shah, Charminar anchors Hyderabad's Old City heritage district.",
        "address": "Char Kaman, Ghansi Bazaar",
        "latitude": 17.3616,
        "longitude": 78.4747,
        "timings": {"open": "09:30", "close": "17:30"},
        "entry_fee": {"indian": 25, "foreigner": 300},
        "best_time_to_visit": "Early morning or evening",
        "accessibility": {"summary": "Outer plaza is easier than upper monument levels."},
        "safety": {"score": 82, "note": "High-footfall zone; use marked pickup points at night."},
        "ai_tips": ["Pair with Laad Bazaar", "Use metro plus auto during peak traffic"],
        "rating": 4.8,
        "review_count": 12400,
        "is_featured": True,
    },
    {
        "name": "Golconda Fort",
        "slug": "golconda-fort",
        "kind": PlaceKind.monument,
        "short_description": "Historic fort complex with acoustic architecture and sunset views.",
        "history": "Golconda Fort grew under the Qutb Shahi dynasty and is tied to the region's diamond trade history.",
        "address": "Ibrahim Bagh",
        "latitude": 17.3833,
        "longitude": 78.4011,
        "timings": {"open": "09:00", "close": "17:30"},
        "entry_fee": {"indian": 25, "foreigner": 300},
        "best_time_to_visit": "Late afternoon",
        "accessibility": {"summary": "Steep climbs; lower ramparts are the easiest section."},
        "safety": {"score": 86, "note": "Carry water and avoid isolated edges after dark."},
        "ai_tips": ["Wear walking shoes", "Reserve time for Qutb Shahi Tombs"],
        "rating": 4.7,
        "review_count": 9300,
        "is_featured": True,
    },
    {
        "name": "Hussain Sagar",
        "slug": "hussain-sagar",
        "kind": PlaceKind.lake,
        "short_description": "Lakefront promenade connecting Hyderabad and Secunderabad.",
        "history": "The lake was built during the Qutb Shahi period and remains a central evening destination.",
        "address": "Tank Bund Road",
        "latitude": 17.4239,
        "longitude": 78.4738,
        "timings": {"open": "06:00", "close": "22:00"},
        "entry_fee": {"general": 0},
        "best_time_to_visit": "Evening",
        "accessibility": {"summary": "Good promenade access and seating."},
        "safety": {"score": 88, "note": "Prefer busy stretches and planned cab pickup points."},
        "ai_tips": ["Check Tank Bund traffic", "Good for family walks"],
        "rating": 4.5,
        "review_count": 8100,
        "is_featured": True,
    },
]

RESTAURANTS = [
    {
        "name": "Paradise Biryani",
        "cuisine": ["Hyderabadi", "Biryani"],
        "price_band": "mid",
        "rating": 4.2,
        "cost_for_two": 900,
        "address": "Secunderabad",
        "latitude": 17.4419,
        "longitude": 78.4873,
        "crowd_level": "high",
        "open_late": True,
        "highlights": ["Hyderabadi biryani", "kebabs", "family seating"],
    },
    {
        "name": "Nimrah Cafe",
        "cuisine": ["Irani Chai", "Bakery"],
        "price_band": "budget",
        "rating": 4.5,
        "cost_for_two": 250,
        "address": "Charminar",
        "latitude": 17.3618,
        "longitude": 78.4748,
        "crowd_level": "very_high",
        "open_late": True,
        "highlights": ["Irani chai", "Osmania biscuits", "Ramzan walk"],
    },
]


async def seed() -> None:
    if not settings.seed_demo_data:
        return

    async with AsyncSessionLocal() as session:
        for data in PLACES:
            existing = await session.execute(select(Place).where(Place.slug == data["slug"]))
            if not existing.scalar_one_or_none():
                session.add(Place(**data))

        for data in RESTAURANTS:
            existing = await session.execute(select(Restaurant).where(Restaurant.name == data["name"]))
            if not existing.scalar_one_or_none():
                session.add(Restaurant(**data))

        event_exists = await session.execute(select(Event).where(Event.title == "Shilparamam Craft Bazaar"))
        if not event_exists.scalar_one_or_none():
            now = datetime.now(UTC)
            session.add(
                Event(
                    title="Shilparamam Craft Bazaar",
                    event_type="exhibition",
                    description="Craft, textile, food, and cultural stalls in Madhapur.",
                    starts_at=now + timedelta(days=7),
                    ends_at=now + timedelta(days=7, hours=6),
                    venue="Shilparamam, Madhapur",
                    latitude=17.4526,
                    longitude=78.3762,
                    ticket_price=60,
                )
            )

        admin_exists = await session.execute(select(User).where(User.email == settings.seed_admin_email))
        if not admin_exists.scalar_one_or_none():
            session.add(
                User(
                    email=settings.seed_admin_email,
                    full_name="Explore Hyderabad Admin",
                    password_hash=hash_password(settings.seed_admin_password),
                    role=UserRole.admin,
                    preferred_language="en",
                    interests=["operations"],
                )
            )

        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
