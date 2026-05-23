import logging
logger = logging.getLogger(__name__)
"""
Alert Tasks — Background alert condition checking.
"""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.tasks.celery_app import celery_app
from app.models.base import async_session
from app.models import User, Wallet, Trade, Alert
from app.core.alerts.dispatcher import alert_dispatcher


def run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task
def check_all_alerts():
    """Check alert conditions for all active users."""
    run_async(_check_alerts())


async def _check_alerts():
    """Async alert checking logic."""
    async with async_session() as db:
        try:
            # Get all active users
            result = await db.execute(
                select(User).where(User.is_active == True)
            )
            users = result.scalars().all()

            for user in users:
                await _check_user_alerts(db, user)

            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.info(f"Alert check error: {e}")


async def _check_user_alerts(db: AsyncSession, user: User):
    """Check alert conditions for a single user."""
    settings = user.settings or {}
    cooldown = settings.get("alert_cooldown_minutes", 30)

    # Get user's wallets
    wallets_result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallets = wallets_result.scalars().all()

    for wallet in wallets:
        # Get recent trades (last 2 hours)
        cutoff = datetime.utcnow() - timedelta(hours=2)
        trades_result = await db.execute(
            select(Trade).where(
                Trade.wallet_id == wallet.id,
                Trade.trade_timestamp >= cutoff,
            ).order_by(Trade.trade_timestamp.desc())
        )
        recent_trades = trades_result.scalars().all()

        if not recent_trades:
            continue

        # Check for recent alerts to avoid spam
        recent_alert_cutoff = datetime.utcnow() - timedelta(minutes=cooldown)
        alert_count_result = await db.execute(
            select(func.count()).where(
                Alert.user_id == user.id,
                Alert.created_at >= recent_alert_cutoff,
            )
        )
        recent_alert_count = alert_count_result.scalar() or 0

        if recent_alert_count > 0:
            continue  # Skip if we sent an alert recently

        # Check overtrade condition
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0)
        today_count_result = await db.execute(
            select(func.count()).where(
                Trade.wallet_id == wallet.id,
                Trade.trade_timestamp >= today_start,
            )
        )
        today_count = today_count_result.scalar() or 0
        max_daily = settings.get("max_daily_trades", 5)

        if today_count > max_daily:
            await alert_dispatcher.dispatch_overtrade(db, user, today_count, max_daily)
            return  # One alert per check cycle

        # Check revenge trade condition
        for trade in recent_trades:
            if trade.emotion_tag == "revenge" and (trade.emotion_score or 0) > 60:
                # Find the loss that triggered it
                prev_trades_result = await db.execute(
                    select(Trade).where(
                        Trade.wallet_id == wallet.id,
                        Trade.trade_timestamp < trade.trade_timestamp,
                        Trade.pnl_usd < 0,
                    ).order_by(Trade.trade_timestamp.desc()).limit(1)
                )
                prev_loss = prev_trades_result.scalar_one_or_none()

                if prev_loss:
                    await alert_dispatcher.dispatch_revenge(
                        db, user,
                        loss_amount=abs(prev_loss.pnl_usd or 0),
                        new_trade_size=trade.value_usd or 0,
                    )
                    return

        # Check FOMO condition
        for trade in recent_trades:
            if trade.emotion_tag == "fomo" and (trade.emotion_score or 0) > 70:
                await alert_dispatcher.dispatch_fomo(
                    db, user,
                    token=trade.token_out_symbol or "Unknown",
                    pump_pct=trade.pnl_percent or 0,
                    historical_loss=340,  # Average FOMO loss
                )
                return


@celery_app.task
def check_single_user_alerts(user_id: str):
    """Check alerts for a single user (called after a new trade is detected)."""
    run_async(_check_single_user(user_id))


async def _check_single_user(user_id: str):
    async with async_session() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            await _check_user_alerts(db, user)
            await db.commit()
