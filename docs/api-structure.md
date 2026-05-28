# API Structure

Base URL: `/api/v1`

| Module | Endpoints | Purpose |
| --- | --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login` | JWT authentication and user onboarding |
| Places | `GET /places`, `GET /places/{slug}` | Tourist places, monuments, lakes, markets, resorts, hidden gems |
| Food | `GET /food/restaurants` | Restaurants, cafes, street food, rooftop, midnight food |
| Events | `GET /events` | Festivals, concerts, exhibitions, Ramzan food streets |
| AI | `POST /ai/chat`, `POST /ai/itinerary` | RAG assistant and itinerary generation |
| Geo | `POST /geo/route-estimate` | Distance, cab fare, metro and traffic hints |
| Admin | `GET /admin/analytics` | Protected dashboard metrics |
| WebSocket | `/api/v1/ws/assistant` | Streaming assistant channel |

