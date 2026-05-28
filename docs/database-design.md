# Database Design

The schema is normalized around user-generated content, canonical geo entities, and AI outputs.

Core tables:

- `users`: identity, role, language, interests, active state.
- `categories`: reusable taxonomy for monuments, food, markets, lakes, nightlife, shopping, temples, mosques, trekking, resorts, weekend getaways, and hidden gems.
- `places`: canonical tourism and city locations with PostGIS geography point, timings, entry fees, accessibility, safety, AI tips, rating aggregates, and feature flags.
- `place_categories`: many-to-many taxonomy mapping.
- `media_assets`: images, videos, drone-view media, AR/VR preview assets, alt text, and AI image tags.
- `restaurants`: cuisine, price band, crowd signals, open-late flag, geo point, and highlights.
- `events`: festivals, exhibitions, concerts, venue geo, dates, and pricing.
- `reviews`: user reviews with sentiment output.
- `favorites`: saved places.
- `itineraries`: generated or saved trip plans with route JSON.
- `ai_recommendations`: persisted assistant/recommendation responses for audit and personalization.

PostGIS powers nearby search, distance ranking, route optimization inputs, and region-based recommendations. Redis caches hot place lists, assistant snippets, crowd predictions, and weather intelligence.

