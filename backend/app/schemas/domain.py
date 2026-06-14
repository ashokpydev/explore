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
    category: str | None = None
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
    distance_from_mgbs_km: float | None = None
    image_key: str | None = None

    model_config = {"from_attributes": True}


class RestaurantPhotoRead(BaseModel):
    photo_url: str | None = None
    source: str
    configured: bool
    attribution_html: list[str] = []


class FoodAIRequest(BaseModel):
    query: str = Field(min_length=2, max_length=800)
    members: int = Field(default=2, ge=1, le=30)
    budget_inr: int = Field(default=2000, ge=100)
    dietary_preference: str | None = None
    open_late: bool | None = None
    area_hint: str | None = None
    language: str = "en"
    limit: int = Field(default=5, ge=1, le=10)


class FoodAIRecommendation(BaseModel):
    name: str
    area: str
    cuisine: list[str]
    highlights: list[str]
    rating: float
    cost_for_two: int
    estimated_total: int
    open_late: bool
    crowd_level: str
    distance_from_mgbs_km: float | None = None
    image_key: str | None = None
    match_score: float
    reasoning: str
    safety_note: str


class FoodAIResponse(BaseModel):
    answer: str
    recommendations: list[FoodAIRecommendation]
    citations: list[str]
    context_sources: list[dict]
    budget_strategy: list[str]
    dietary_notes: list[str]
    usage: dict = {}


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
    message: str = Field(min_length=1, max_length=3000)
    language: str = "en"
    conversation_id: UUID | None = None
    latitude: float | None = None
    longitude: float | None = None
    trip_context: dict = {}


class ChatResponse(BaseModel):
    answer: str
    conversation_id: UUID | None = None
    citations: list[str] = []
    suggestions: list[str] = []
    context_sources: list[dict] = []
    usage: dict = {}


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


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    language: str = "en"
    limit: int = Field(default=5, ge=1, le=20)


class KnowledgeSearchResult(BaseModel):
    title: str
    content: str
    citation: str
    source_kind: str
    score: float


class AIReindexResponse(BaseModel):
    indexed: int
    embedded: int


class IntentExtractionRequest(BaseModel):
    message: str = Field(min_length=2, max_length=1200)
    language: str = "en"
    user_profile: dict = {}


class IntentExtractionResponse(BaseModel):
    intent: str
    confidence: float
    entities: dict
    follow_up_questions: list[str]
    recommended_tools: list[str]


class ModerationRequest(BaseModel):
    text: str = Field(min_length=2, max_length=3000)
    content_type: str = "review"


class ModerationResponse(BaseModel):
    decision: str
    categories: list[str]
    severity: float
    rewritten_text: str | None = None
    rationale: str


class ImageTaggingRequest(BaseModel):
    image_url: str | None = None
    caption: str | None = None
    place_hint: str | None = None


class ImageTaggingResponse(BaseModel):
    alt_text: str
    tags: list[str]
    safety_flags: list[str]
    suggested_caption: str
    confidence: float


class TripCritiqueRequest(BaseModel):
    itinerary: list[dict]
    budget_inr: int = Field(ge=500)
    traveler_type: str = "solo"
    language: str = "en"


class TripCritiqueResponse(BaseModel):
    score: float
    risks: list[str]
    optimizations: list[str]
    budget_notes: list[str]
    safety_notes: list[str]


class GenAIShowcaseResponse(BaseModel):
    capabilities: list[dict]
    architecture: list[str]
    open_stack: list[str]
    cv_bullets: list[str]


class ConversationMessageRead(BaseModel):
    id: UUID
    role: str
    content: str
    citations: list[str]
    message_metadata: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationRead(BaseModel):
    id: UUID
    title: str
    language: str
    summary: str | None
    memory: dict
    messages: list[ConversationMessageRead] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IngestionDocument(BaseModel):
    title: str = Field(min_length=2, max_length=220)
    content: str = Field(min_length=20)
    citation: str = Field(min_length=2, max_length=600)
    source_kind: str = "open_data"
    language: str = "en"
    trust_level: float = Field(default=0.78, ge=0, le=1)
    metadata: dict = {}


class IngestionRequest(BaseModel):
    source_kind: str = "open_data"
    documents: list[IngestionDocument] = []
    source_urls: list[str] = []
    include_embeddings: bool = True


class IngestionResponse(BaseModel):
    run_id: UUID | None = None
    status: str
    documents_seen: int
    chunks_indexed: int
    embedded: int
    errors: list[str] = []


class RAGEvalCase(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    required_terms: list[str] = []
    expected_citations: list[str] = []


class RAGEvalRequest(BaseModel):
    name: str = Field(default="manual-rag-eval", min_length=2, max_length=180)
    cases: list[RAGEvalCase] = Field(min_length=1, max_length=50)
    language: str = "en"


class RAGEvalResponse(BaseModel):
    run_id: UUID | None = None
    name: str
    total_cases: int
    average_score: float
    pass_rate: float
    results: list[dict]


class AIUsageSummaryResponse(BaseModel):
    total_requests: int
    total_tokens: int
    estimated_cost_usd: float
    average_latency_ms: float
    by_operation: list[dict]
    recent_requests: list[dict]
