import enum
import uuid
from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    JSON,
    Numeric,
    String,
    Table,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geography
from app.db.base import Base


class UserRole(str, enum.Enum):
    user = "user"
    guide = "guide"
    admin = "admin"


class PlaceKind(str, enum.Enum):
    monument = "monument"
    lake = "lake"
    temple = "temple"
    mosque = "mosque"
    market = "market"
    mall = "mall"
    resort = "resort"
    trekking = "trekking"
    getaway = "weekend_getaway"
    hidden_gem = "hidden_gem"
    experience = "local_experience"


place_categories = Table(
    "place_categories",
    Base.metadata,
    Column("place_id", ForeignKey("places.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user)
    preferred_language: Mapped[str] = mapped_column(String(16), default="en")
    interests: Mapped[list[str]] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    reviews: Mapped[list["Review"]] = relationship(back_populates="user")
    favorites: Mapped[list["Favorite"]] = relationship(back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text)


class Place(Base, TimestampMixin):
    __tablename__ = "places"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(180), index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    kind: Mapped[PlaceKind] = mapped_column(Enum(PlaceKind), index=True)
    short_description: Mapped[str] = mapped_column(String(300))
    history: Mapped[str] = mapped_column(Text)
    address: Mapped[str] = mapped_column(String(300))
    city: Mapped[str] = mapped_column(String(100), default="Hyderabad")
    state: Mapped[str] = mapped_column(String(100), default="Telangana")
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    location = mapped_column(Geography(geometry_type="POINT", srid=4326, spatial_index=True))
    timings: Mapped[dict] = mapped_column(JSON, default=dict)
    entry_fee: Mapped[dict] = mapped_column(JSON, default=dict)
    best_time_to_visit: Mapped[str] = mapped_column(String(180))
    accessibility: Mapped[dict] = mapped_column(JSON, default=dict)
    safety: Mapped[dict] = mapped_column(JSON, default=dict)
    ai_tips: Mapped[list[str]] = mapped_column(JSON, default=list)
    rating: Mapped[float] = mapped_column(Float, default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    media: Mapped[list["MediaAsset"]] = relationship(back_populates="place", cascade="all, delete")
    reviews: Mapped[list["Review"]] = relationship(back_populates="place")
    categories: Mapped[list[Category]] = relationship(secondary=place_categories)


class MediaAsset(Base, TimestampMixin):
    __tablename__ = "media_assets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    place_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("places.id", ondelete="CASCADE"))
    url: Mapped[str] = mapped_column(String(600))
    type: Mapped[str] = mapped_column(String(40))
    alt_text: Mapped[str] = mapped_column(String(240))
    ai_tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    place: Mapped[Place | None] = relationship(back_populates="media")


class Restaurant(Base, TimestampMixin):
    __tablename__ = "restaurants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(180), index=True)
    cuisine: Mapped[list[str]] = mapped_column(JSON, default=list)
    price_band: Mapped[str] = mapped_column(String(24))
    rating: Mapped[float] = mapped_column(Float, default=0)
    cost_for_two: Mapped[int] = mapped_column(Integer)
    address: Mapped[str] = mapped_column(String(300))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    location = mapped_column(Geography(geometry_type="POINT", srid=4326, spatial_index=True))
    crowd_level: Mapped[str] = mapped_column(String(40), default="moderate")
    open_late: Mapped[bool] = mapped_column(Boolean, default=False)
    highlights: Mapped[list[str]] = mapped_column(JSON, default=list)


class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(220), index=True)
    event_type: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    venue: Mapped[str] = mapped_column(String(240))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    ticket_price: Mapped[Numeric | None] = mapped_column(Numeric(10, 2))


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("user_id", "place_id", name="one_review_per_place_user"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    place_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("places.id", ondelete="CASCADE"))
    rating: Mapped[int] = mapped_column(Integer)
    body: Mapped[str] = mapped_column(Text)
    sentiment: Mapped[str | None] = mapped_column(String(40))
    user: Mapped[User] = relationship(back_populates="reviews")
    place: Mapped[Place] = relationship(back_populates="reviews")


class Itinerary(Base, TimestampMixin):
    __tablename__ = "itineraries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(180))
    trip_type: Mapped[str] = mapped_column(String(60))
    days: Mapped[int] = mapped_column(Integer)
    budget_inr: Mapped[int] = mapped_column(Integer)
    route: Mapped[list[dict]] = mapped_column(JSON, default=list)
    ai_reasoning: Mapped[str] = mapped_column(Text)


class Favorite(Base, TimestampMixin):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "place_id", name="favorite_once"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    place_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("places.id", ondelete="CASCADE"))
    user: Mapped[User] = relationship(back_populates="favorites")


class AIRecommendation(Base, TimestampMixin):
    __tablename__ = "ai_recommendations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    intent: Mapped[str] = mapped_column(String(160), index=True)
    prompt: Mapped[str] = mapped_column(Text)
    response: Mapped[dict] = mapped_column(JSON)
    model: Mapped[str] = mapped_column(String(80))
