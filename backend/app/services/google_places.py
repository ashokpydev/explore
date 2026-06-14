from __future__ import annotations

import time
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings


PLACES_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PLACES_PHOTO_MEDIA_BASE_URL = "https://places.googleapis.com/v1"
PHOTO_CACHE_SECONDS = 60 * 60 * 12

_photo_cache: dict[str, tuple[float, dict[str, Any]]] = {}


def _cache_key(name: str, address: str, width: int) -> str:
    return f"{name.strip().lower()}|{address.strip().lower()}|{width}"


async def get_restaurant_photo(name: str, address: str, width: int = 900) -> dict[str, Any]:
    if not settings.google_maps_api_key:
        return {"photo_url": None, "source": "not_configured", "configured": False, "attribution_html": []}

    bounded_width = max(200, min(width, 1600))
    key = _cache_key(name, address, bounded_width)
    cached = _photo_cache.get(key)
    if cached and time.time() - cached[0] < PHOTO_CACHE_SECONDS:
        return cached[1]

    query = f"{name} {address} Hyderabad restaurant"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.google_maps_api_key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.photos.name,places.photos.authorAttributions",
    }
    payload = {
        "textQuery": query,
        "includedType": "restaurant",
        "languageCode": "en",
        "regionCode": "IN",
        "pageSize": 1,
    }

    async with httpx.AsyncClient(timeout=8) as client:
        search_response = await client.post(PLACES_TEXT_SEARCH_URL, headers=headers, json=payload)
        search_response.raise_for_status()
        places = search_response.json().get("places", [])
        first_place = places[0] if places else None
        first_photo = first_place.get("photos", [None])[0] if first_place else None
        photo_name = first_photo.get("name") if first_photo else None

        if not photo_name:
            result = {"photo_url": None, "source": "google_places_no_photo", "configured": True, "attribution_html": []}
            _photo_cache[key] = (time.time(), result)
            return result

        photo_path = quote(photo_name, safe="/")
        media_response = await client.get(
            f"{PLACES_PHOTO_MEDIA_BASE_URL}/{photo_path}/media",
            headers={"X-Goog-Api-Key": settings.google_maps_api_key},
            params={"maxWidthPx": bounded_width, "skipHttpRedirect": "true"},
        )
        media_response.raise_for_status()
        photo_url = media_response.json().get("photoUri")

    result = {
        "photo_url": photo_url,
        "source": "google_places",
        "configured": True,
        "attribution_html": [
            attribution.get("displayName", "")
            for attribution in first_photo.get("authorAttributions", [])
            if attribution.get("displayName")
        ],
    }
    _photo_cache[key] = (time.time(), result)
    return result
