import logging
logger = logging.getLogger(__name__)
"""
Report Tasks — Scheduled report generation and delivery.
"""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.tasks.celery_app import celery_app
from app.models.base import async_session
from app.models import User, Wallet, Trade, EmotionalScore, PersonalityProfile
from app.core.alerts.dispatcher import alert_dispatcher


def run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task
def send_daily_summaries():
    """Send daily summary reports to all users with alerts enabled."""
    run_async(_send_daily_summaries())


async def _send_daily_summaries():
    async with async_session() as db:
        try:
            result = await db.execute(select(User).where(User.is_active == True))
            users = result.scalars().all()

            for user in users:
                settings = user.settings or {}
                if not settings.get("daily_summary", True):
                    continue

                data = await _build_report_data(db, user, days=1)
                if data:
                    await alert_dispatcher.dispatch_daily_summary(db, user, data)

            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.info(f"Daily summary error: {e}")


@celery_app.task
def send_weekly_reports():
    """Send weekly report to all users."""
    run_async(_send_weekly_reports())


async def _send_weekly_reports():
    async with async_session() as db:
        try:
            result = await db.execute(select(User).where(User.is_active == True))
            users = result.scalars().all()

            for user in users:
                settings = user.settings or {}
                if not settings.get("weekly_report", True):
                    continue

                data = await _build_report_data(db, user, days=7)
                if data:
                    # Send via Telegram
                    if settings.get("telegram_alerts") and user.telegram_chat_id:
                        from app.core.alerts.channels.telegram import TelegramAlertSender
                        telegram = TelegramAlertSender()
                        await telegram.send_daily_summary(user.telegram_chat_id, data)
                        await telegram.close()

                    # Send via Email
                    if settings.get("email_alerts") and user.email:
                        from app.core.alerts.channels.email import EmailAlertSender
                        email = EmailAlertSender()
                        await email.send_daily_report(user.email, data)
                        await email.close()

            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.info(f"Weekly report error: {e}")


async def _build_report_data(db: AsyncSession, user: User, days: int = 1) -> dict:
    """Build report data for a user."""
    # Get user's wallet
    wallets_result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet = wallets_result.scalar_one_or_none()

    if not wallet:
        return None

    # Get trades in period
    start = datetime.utcnow() - timedelta(days=days)
    trades_result = await db.execute(
        select(Trade).where(
            Trade.wallet_id == wallet.id,
            Trade.trade_timestamp >= start,
        )
    )
    trades = trades_result.scalars().all()

    # Get latest scores
    scores_result = await db.execute(
        select(EmotionalScore).where(EmotionalScore.wallet_id == wallet.id)
        .order_by(EmotionalScore.created_at.desc()).limit(1)
    )
    scores = scores_result.scalar_one_or_none()

    # Get personality
    personality_result = await db.execute(
        select(PersonalityProfile).where(PersonalityProfile.wallet_id == wallet.id)
        .order_by(PersonalityProfile.created_at.desc()).limit(1)
    )
    personality = personality_result.scalar_one_or_none()

    # Calculate stats
    trade_count = len(trades)
    wins = sum(1 for t in trades if (t.pnl_usd or 0) > 0)
    total_pnl = sum(t.pnl_usd or 0 for t in trades)
    emotional_loss = sum(abs(t.pnl_usd or 0) for t in trades if t.emotion_tag in ["fomo", "panic", "revenge"])

    return {
        "scores": {
            "fomo": scores.fomo if scores else 0,
            "panic": scores.panic if scores else 0,
            "revenge": scores.revenge if scores else 0,
            "overtrade": scores.overtrade if scores else 0,
            "diamond_hands": scores.diamond_hands if scores else 0,
        },
        "stats": {
            "trade_count": trade_count,
            "win_rate": round(wins / max(1, trade_count) * 100, 1),
            "total_pnl": round(total_pnl, 2),
            "emotional_loss": round(emotional_loss, 2),
        },
        "personality": {
            "name": personality.archetype_name if personality else "Unknown",
            "emoji": "",
            "description": personality.description if personality else "",
        },
        "insights": [],
    }
