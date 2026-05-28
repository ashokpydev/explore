from fastapi import APIRouter
from app.api.routes import admin, ai, auth, events, food, geo, places, ws

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(places.router)
api_router.include_router(food.router)
api_router.include_router(events.router)
api_router.include_router(ai.router)
api_router.include_router(geo.router)
api_router.include_router(admin.router)
api_router.include_router(ws.router)

