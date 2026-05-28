from fastapi import APIRouter
from pydantic import BaseModel
from app.services.geo import estimate_cab_fare_km, haversine_km

router = APIRouter(prefix="/geo", tags=["geo"])


class RouteEstimate(BaseModel):
    from_latitude: float
    from_longitude: float
    to_latitude: float
    to_longitude: float
    traffic_multiplier: float = 1.2


@router.post("/route-estimate")
async def route_estimate(payload: RouteEstimate) -> dict:
    distance = haversine_km(
        payload.from_latitude, payload.from_longitude, payload.to_latitude, payload.to_longitude
    )
    fare = estimate_cab_fare_km(distance, payload.traffic_multiplier)
    return {
        **fare,
        "metro_hint": "Check Hyderabad Metro interchange options at Ameerpet, MG Bus Station, and Parade Ground.",
        "traffic_hint": "Peak congestion is common around HITEC City, Punjagutta, Mehdipatnam, and Old City.",
    }

