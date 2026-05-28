from math import asin, cos, radians, sin, sqrt


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * radius * asin(sqrt(a))


def estimate_cab_fare_km(distance_km: float, traffic_multiplier: float = 1.2) -> dict:
    base = 75
    per_km = 22
    fare = round((base + distance_km * per_km) * traffic_multiplier)
    return {"distance_km": round(distance_km, 2), "estimated_fare_inr": fare, "traffic_multiplier": traffic_multiplier}

