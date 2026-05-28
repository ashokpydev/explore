const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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
}) {
  const response = await fetch(`${API_URL}/ai/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Itinerary request failed");
  return response.json();
}

