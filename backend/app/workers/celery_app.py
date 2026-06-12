from celery import Celery
from app.core.config import settings

celery_app = Celery("explore_hyderabad", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.imports = ("app.workers.tasks",)
celery_app.conf.task_routes = {
    "refresh_crowd_predictions": {"queue": "ai"},
    "reindex_ai_knowledge": {"queue": "ai"},
}
