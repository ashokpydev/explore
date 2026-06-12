const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type ApiPlace = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  short_description: string;
  history: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  timings: Record<string, unknown>;
  entry_fee: Record<string, unknown>;
  best_time_to_visit: string;
  accessibility: Record<string, unknown>;
  safety: Record<string, unknown>;
  ai_tips: string[];
  rating: number;
  review_count: number;
  is_featured: boolean;
};

export type ApiRestaurant = {
  id: string;
  name: string;
  cuisine: string[];
  price_band: string;
  rating: number;
  cost_for_two: number;
  address: string;
  latitude: number;
  longitude: number;
  crowd_level: string;
  open_late: boolean;
  highlights: string[];
};

export type FoodAIRecommendation = {
  name: string;
  area: string;
  cuisine: string[];
  highlights: string[];
  rating: number;
  cost_for_two: number;
  estimated_total: number;
  open_late: boolean;
  crowd_level: string;
  match_score: number;
  reasoning: string;
  safety_note: string;
};

export type FoodAIResponse = {
  answer: string;
  recommendations: FoodAIRecommendation[];
  citations: string[];
  context_sources: AIContextSource[];
  budget_strategy: string[];
  dietary_notes: string[];
  usage: AIUsage;
};

export type AdminAnalytics = {
  counts: Record<string, number>;
  moderation_queue: number;
  seo_pages_indexed: number;
};

export type AIContextSource = {
  title: string;
  content: string;
  citation: string;
  source_kind: string;
  score: number;
};

export type AIUsage = {
  model: string;
  status: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  estimated_cost_usd: number;
  retrieved_count: number;
};

export type IntentExtraction = {
  intent: string;
  confidence: number;
  entities: Record<string, unknown>;
  follow_up_questions: string[];
  recommended_tools: string[];
};

export type ModerationResult = {
  decision: string;
  categories: string[];
  severity: number;
  rewritten_text?: string | null;
  rationale: string;
};

export type ImageTaggingResult = {
  alt_text: string;
  tags: string[];
  safety_flags: string[];
  suggested_caption: string;
  confidence: number;
};

export type TripCritiqueResult = {
  score: number;
  risks: string[];
  optimizations: string[];
  budget_notes: string[];
  safety_notes: string[];
};

export type GenAIShowcase = {
  capabilities: Array<{ name: string; evidence: string }>;
  architecture: string[];
  open_stack: string[];
  cv_bullets: string[];
};

export type IngestionResult = {
  run_id?: string | null;
  status: string;
  documents_seen: number;
  chunks_indexed: number;
  embedded: number;
  errors: string[];
};

export type RAGEvalResult = {
  run_id?: string | null;
  name: string;
  total_cases: number;
  average_score: number;
  pass_rate: number;
  results: Array<Record<string, unknown>>;
};

export type AIUsageSummary = {
  total_requests: number;
  total_tokens: number;
  estimated_cost_usd: number;
  average_latency_ms: number;
  by_operation: Array<Record<string, unknown>>;
  recent_requests: Array<Record<string, unknown>>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  if (!response.ok) throw new Error(`API request failed: ${path}`);
  return response.json() as Promise<T>;
}

export function listPlaces(params: { query?: string; kind?: string; featured?: boolean; limit?: number } = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  return request<ApiPlace[]>(`/places${search.size ? `?${search}` : ""}`);
}

export function listRestaurants(params: { cuisine?: string; open_late?: boolean; limit?: number } = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  return request<ApiRestaurant[]>(`/food/restaurants${search.size ? `?${search}` : ""}`);
}

export function getFoodAIRecommendations(payload: {
  query: string;
  members: number;
  budget_inr: number;
  dietary_preference?: string;
  open_late?: boolean;
  area_hint?: string;
  limit?: number;
}) {
  return request<FoodAIResponse>("/food/ai/recommendations", {
    method: "POST",
    body: JSON.stringify({ ...payload, language: "en" })
  });
}

export function getAdminAnalytics(token: string) {
  return request<AdminAnalytics>("/admin/analytics", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function aiChat(message: string, conversationId?: string | null) {
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language: "en", conversation_id: conversationId })
  });
  if (!response.ok) throw new Error("AI assistant request failed");
  return response.json() as Promise<{
    answer: string;
    suggestions: string[];
    citations: string[];
    context_sources: AIContextSource[];
    conversation_id?: string | null;
    usage: AIUsage;
  }>;
}

export async function aiChatStream(
  message: string,
  conversationId: string | null,
  onToken: (token: string) => void
) {
  const response = await fetch(`${API_URL}/ai/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language: "en", conversation_id: conversationId })
  });
  if (!response.ok || !response.body) throw new Error("AI stream request failed");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalPayload: unknown = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
      if (!dataLine) continue;
      const parsed = JSON.parse(dataLine.slice(6));
      if ("text" in parsed) onToken(parsed.text);
      else finalPayload = parsed;
    }
  }
  return finalPayload as {
    answer: string;
    suggestions: string[];
    citations: string[];
    context_sources: AIContextSource[];
    conversation_id?: string | null;
    usage: AIUsage;
  } | null;
}

export async function createItinerary(payload: {
  days: number;
  trip_type: string;
  budget_inr: number;
  interests: string[];
  language?: string;
  origin?: string;
  destination?: string;
  travelers?: number;
}) {
  const response = await fetch(`${API_URL}/ai/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Itinerary request failed");
  return response.json();
}

export async function searchKnowledge(query: string, token?: string) {
  const response = await fetch(`${API_URL}/ai/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ query, limit: 5 })
  });
  if (!response.ok) throw new Error("Knowledge search failed");
  return response.json() as Promise<AIContextSource[]>;
}

export async function reindexKnowledge(token: string, includeEmbeddings = true) {
  const response = await fetch(`${API_URL}/ai/reindex?include_embeddings=${includeEmbeddings}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("AI reindex failed");
  return response.json() as Promise<{ indexed: number; embedded: number }>;
}

export function extractIntent(message: string) {
  return request<IntentExtraction>("/ai/intent", {
    method: "POST",
    body: JSON.stringify({ message, language: "en" })
  });
}

export function moderateContent(text: string) {
  return request<ModerationResult>("/ai/moderate", {
    method: "POST",
    body: JSON.stringify({ text, content_type: "review" })
  });
}

export function tagTravelImage(payload: { image_url?: string; caption?: string; place_hint?: string }) {
  return request<ImageTaggingResult>("/ai/image-tags", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function critiqueTrip(payload: {
  itinerary: Array<Record<string, unknown>>;
  budget_inr: number;
  traveler_type: string;
}) {
  return request<TripCritiqueResult>("/ai/trip-critique", {
    method: "POST",
    body: JSON.stringify({ ...payload, language: "en" })
  });
}

export function getGenAIShowcase() {
  return request<GenAIShowcase>("/ai/showcase");
}

export function ingestKnowledge(token: string) {
  return request<IngestionResult>("/ai/ingest", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      source_kind: "open_tourism_note",
      include_embeddings: true,
      documents: [
        {
          title: "Hyderabad monsoon travel safety note",
          content:
            "During monsoon months, Hyderabad travelers should buffer extra road time, avoid low-lying flooded routes, carry rain protection, and prefer metro links for longer cross-city trips. Outdoor forts and lakefront walks are better planned earlier in the day when rain risk is lower.",
          citation: "Curated open travel operations note",
          source_kind: "open_tourism_note",
          trust_level: 0.76,
          metadata: { topic: "weather_safety" }
        }
      ]
    })
  });
}

export function runRAGEval(token: string) {
  return request<RAGEvalResult>("/ai/eval", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: "portfolio-rag-smoke-eval",
      language: "en",
      cases: [
        {
          query: "What should I know about Charminar and Laad Bazaar?",
          required_terms: ["Charminar", "Laad Bazaar"],
          expected_citations: ["Explore Hyderabad"]
        },
        {
          query: "How should I plan Hyderabad during monsoon?",
          required_terms: ["monsoon", "metro", "rain"],
          expected_citations: ["travel"]
        }
      ]
    })
  });
}

export function getAIUsageSummary(token: string) {
  return request<AIUsageSummary>("/ai/usage", {
    headers: { Authorization: `Bearer ${token}` }
  });
}
