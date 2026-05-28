from app.workers.celery_app import celery_app


@celery_app.task(name="refresh_crowd_predictions")
def refresh_crowd_predictions() -> dict:
    zones = {
        "old_city": {"crowd_level": "very_high", "confidence": 0.82},
        "hitec_city": {"crowd_level": "high", "confidence": 0.78},
        "tank_bund": {"crowd_level": "moderate", "confidence": 0.74},
        "golconda": {"crowd_level": "moderate", "confidence": 0.71},
    }
    return {"status": "refreshed", "zones": zones}
