from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=160)
    password: str = Field(min_length=8)
    preferred_language: str = "en"
    interests: list[str] = []


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    preferred_language: str
    interests: list[str]

    model_config = {"from_attributes": True}


class PlaceRead(BaseModel):
    id: UUID
    name: str
    slug: str
    kind: str
    short_description: str
    history: str
    address: str
    city: str
    state: str
    latitude: float
    longitude: float
    timings: dict
    entry_fee: dict
    best_time_to_visit: str
    accessibility: dict
    safety: dict
    ai_tips: list[str]
    rating: float
    review_count: int
    is_featured: bool

    model_config = {"from_attributes": True}


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    body: str = Field(min_length=5, max_length=2000)


class ReviewRead(BaseModel):
    id: UUID
    user_id: UUID
    place_id: UUID
    rating: int
    body: str
    sentiment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PlaceSearchParams(BaseModel):
    query: str | None = None
    category: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    radius_km: float = 8
    limit: int = Field(default=20, le=100)


class RestaurantRead(BaseModel):
    id: UUID
    name: str
    cuisine: list[str]
    price_band: str
    rating: float
    cost_for_two: int
    address: str
    latitude: float
    longitude: float
    crowd_level: str
    open_late: bool
    highlights: list[str]

    model_config = {"from_attributes": True}


class EventRead(BaseModel):
    id: UUID
    title: str
    event_type: str
    description: str
    starts_at: datetime
    ends_at: datetime
    venue: str
    latitude: float
    longitude: float
    ticket_price: float | None

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    latitude: float | None = None
    longitude: float | None = None
    trip_context: dict = {}


class ChatResponse(BaseModel):
    answer: str
    citations: list[str] = []
    suggestions: list[str] = []


class ItineraryRequest(BaseModel):
    days: int = Field(ge=1, le=10)
    trip_type: str
    budget_inr: int = Field(ge=500)
    interests: list[str]
    start_latitude: float | None = None
    start_longitude: float | None = None
    language: str = "en"


class ItineraryResponse(BaseModel):
    title: str
    days: int
    budget_inr: int
    route: list[dict]
    ai_reasoning: str
