from app.workers.celery_app import celery_app


@celery_app.task(name="refresh_crowd_predictions")
def refresh_crowd_predictions() -> dict:
    return {"status": "queued", "message": "Crowd prediction refresh placeholder for ML job"}

