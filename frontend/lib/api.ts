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

export type AdminAnalytics = {
  counts: Record<string, number>;
  moderation_queue: number;
  seo_pages_indexed: number;
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

export function getAdminAnalytics(token: string) {
  return request<AdminAnalytics>("/admin/analytics", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function aiChat(message: string) {
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language: "en" })
  });
  if (!response.ok) throw new Error("AI assistant request failed");
  return response.json() as Promise<{ answer: string; suggestions: string[]; citations: string[] }>;
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
