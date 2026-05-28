from openai import AsyncOpenAI
from app.core.config import settings

SYSTEM_PROMPT = """
You are Explore Hyderabad, an expert local tourism assistant for Hyderabad and Telangana.
Give practical, safety-aware, culturally respectful recommendations. Prefer concise plans with
timings, budget cues, transport options, accessibility notes, and local-language hints.
"""

HYDERABAD_KNOWLEDGE = [
    "Charminar is a 1591 monument in the Old City, surrounded by Laad Bazaar and heritage food streets.",
    "Golconda Fort is best visited near sunset; the sound and light show is a popular evening option.",
    "Hussain Sagar and Tank Bund connect Hyderabad and Secunderabad with lakeside walks and viewpoints.",
    "Ramzan night food walks around Charminar are crowded; plan transport and safety checkpoints early.",
    "Bathukamma and Bonalu are major Telangana festivals with processions, flowers, music, and community rituals.",
]


class AIService:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    async def answer(self, message: str, language: str = "en", context: dict | None = None) -> dict:
        citations = self._retrieve(message)
        if not self.client:
            return {
                "answer": self._offline_answer(message, citations, language),
                "citations": citations,
                "suggestions": ["Build a 2-day itinerary", "Find food near me", "Show safe night spots"],
            }
        response = await self.client.responses.create(
            model=settings.openai_model,
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Language: {language}\nContext: {context or {}}\nRAG notes: {citations}\n\n{message}",
                },
            ],
        )
        return {
            "answer": response.output_text,
            "citations": citations,
            "suggestions": ["Nearby options", "Budget version", "Family friendly version"],
        }

    async def itinerary(self, payload: dict) -> dict:
        interests = ", ".join(payload.get("interests", []))
        prompt = (
            f"Create a {payload['days']}-day {payload['trip_type']} Hyderabad plan under "
            f"INR {payload['budget_inr']} focused on {interests}."
        )
        answer = await self.answer(prompt, payload.get("language", "en"), payload)
        return {
            "title": f"{payload['days']}-Day {payload['trip_type'].title()} Hyderabad Plan",
            "days": payload["days"],
            "budget_inr": payload["budget_inr"],
            "route": [
                {
                    "day": day,
                    "stops": ["Charminar", "Salar Jung Museum", "Hussain Sagar"]
                    if day == 1
                    else ["Golconda Fort", "Qutb Shahi Tombs", "Jubilee Hills cafe trail"],
                    "transport": "Metro, cab, and short walks",
                    "budget_note": "Reserve 25% for food and local shopping.",
                }
                for day in range(1, payload["days"] + 1)
            ],
            "ai_reasoning": answer["answer"],
        }

    def _retrieve(self, query: str) -> list[str]:
        lowered = query.lower()
        ranked = [item for item in HYDERABAD_KNOWLEDGE if any(word in item.lower() for word in lowered.split())]
        return ranked[:4] or HYDERABAD_KNOWLEDGE[:3]

    def _offline_answer(self, message: str, citations: list[str], language: str) -> str:
        return (
            "OpenAI is not configured, so this response uses the bundled Hyderabad knowledge base. "
            f"For '{message}', start with {citations[0]} Add traffic buffer, check weather, "
            "and keep late-night plans around well-lit, high-footfall areas."
        )


ai_service = AIService()

