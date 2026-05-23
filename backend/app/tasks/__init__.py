# Auto-import all task modules so Celery autodiscover finds them
from app.tasks.scan_tasks import scan_wallet_task, rescan_active_wallets  # noqa
from app.tasks.alert_tasks import check_all_alerts, check_single_user_alerts  # noqa
from app.tasks.report_tasks import send_daily_summaries, send_weekly_reports  # noqa
