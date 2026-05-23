"""
Celery Application — Background task queue configuration.
"""

from celery import Celery
from celery.schedules import crontab
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "crypto_therapist",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 minutes max per task
    task_soft_time_limit=300,  # 5 minutes soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
)

# Periodic tasks schedule
celery_app.conf.beat_schedule = {
    # Check for alert conditions every 5 minutes
    "check-alerts": {
        "task": "app.tasks.alert_tasks.check_all_alerts",
        "schedule": crontab(minute="*/5"),
    },
    # Send daily summary at 9 AM UTC
    "daily-summary": {
        "task": "app.tasks.report_tasks.send_daily_summaries",
        "schedule": crontab(hour=9, minute=0),
    },
    # Send weekly report on Monday at 10 AM UTC
    "weekly-report": {
        "task": "app.tasks.report_tasks.send_weekly_reports",
        "schedule": crontab(hour=10, minute=0, day_of_week=1),
    },
    # Rescan active wallets every 6 hours
    "rescan-wallets": {
        "task": "app.tasks.scan_tasks.rescan_active_wallets",
        "schedule": crontab(minute=0, hour="*/6"),
    },
}

# Auto-discover tasks
celery_app.autodiscover_tasks(["app.tasks"])
