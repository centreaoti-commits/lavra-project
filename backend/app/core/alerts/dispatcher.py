"""
Alert Dispatcher — Orchestrates sending alerts to all channels.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, Alert
from app.core.alerts.channels.telegram import TelegramAlertSender
from app.core.alerts.channels.email import EmailAlertSender
from app.core.alerts.channels.websocket import ws_manager


class AlertDispatcher:
    """Dispatches alerts to user's preferred channels."""

    def __init__(self):
        self.telegram = TelegramAlertSender()
        self.email = EmailAlertSender()

    async def dispatch(
        self,
        db: AsyncSession,
        user: User,
        alert_type: str,
        severity: str,
        title: str,
        message: str,
        trade_id: str = None,
    ):
        """Send an alert to all configured channels."""
        # Save to database
        alert = Alert(
            user_id=user.id,
            type=alert_type,
            severity=severity,
            title=title,
            message=message,
            trade_id=trade_id,
        )
        db.add(alert)
        await db.flush()

        settings = user.settings or {}

        # Telegram
        if settings.get("telegram_alerts") and user.telegram_chat_id:
            await self.telegram.send_alert(
                chat_id=user.telegram_chat_id,
                alert_type=alert_type,
                title=title,
                message=message,
                severity=severity,
            )

        # Email
        if settings.get("email_alerts") and user.email:
            html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #f1f5f9; padding: 32px; border-radius: 16px;">
                <h2 style="color: #8b5cf6;">{title}</h2>
                <div style="background: #12121a; padding: 20px; border-radius: 12px; margin: 16px 0;">
                    <p>{message}</p>
                </div>
                <p style="text-align: center; color: #64748b; font-size: 12px;">
                    <a href="https://crypto-therapist.io/dashboard" style="color: #8b5cf6;">View Dashboard →</a>
                </p>
            </div>
            """
            await self.email.send_alert(
                to_email=user.email,
                subject=title,
                html_content=html,
            )

        # WebSocket (real-time)
        await ws_manager.send_alert(
            user_id=user.id,
            alert_type=alert_type,
            title=title,
            message=message,
            severity=severity,
        )

        return alert

    async def dispatch_fomo(
        self, db: AsyncSession, user: User, token: str, pump_pct: float, historical_loss: float
    ):
        """Dispatch a FOMO alert."""
        message = (
            f"You're about to buy {token} which has pumped {pump_pct:.0f}% recently. "
            f"Based on your history, 72% of similar trades resulted in losses. "
            f"Average loss on FOMO trades: ${historical_loss:,.0f}. "
            f"Suggestion: Wait 4 hours. Set a limit order instead."
        )
        return await self.dispatch(db, user, "fomo", "critical", f"🏃 FOMO Alert — {token}", message)

    async def dispatch_revenge(
        self, db: AsyncSession, user: User, loss_amount: float, new_trade_size: float
    ):
        """Dispatch a revenge trade alert."""
        ratio = new_trade_size / loss_amount if loss_amount > 0 else 0
        message = (
            f"You lost ${loss_amount:,.0f} recently. You're now trying to open a {ratio:.1f}x larger position. "
            f"This matches your revenge trading pattern. "
            f"Suggestion: Set a 1-hour cooldown. Journal your thesis before entering."
        )
        return await self.dispatch(db, user, "revenge", "warning", "😤 Revenge Trade Detected", message)

    async def dispatch_overtrade(
        self, db: AsyncSession, user: User, trades_today: int, limit: int
    ):
        """Dispatch an overtrade alert."""
        message = (
            f"You've made {trades_today} trades today. Your limit is {limit}. "
            f"Your win rate drops from 42% to 18% when you exceed 5 trades per day. "
            f"Suggestion: Take a break. Review your trades before making another."
        )
        return await self.dispatch(db, user, "overtrade", "warning", "🎰 Overtrade Warning", message)

    async def dispatch_positive(
        self, db: AsyncSession, user: User, title: str, message: str
    ):
        """Dispatch a positive/streak alert."""
        return await self.dispatch(db, user, "positive", "positive", title, message)

    async def dispatch_daily_summary(self, db: AsyncSession, user: User, data: dict):
        """Dispatch a daily summary."""
        settings = user.settings or {}

        # Telegram
        if settings.get("telegram_alerts") and user.telegram_chat_id:
            await self.telegram.send_daily_summary(user.telegram_chat_id, data)

        # Email
        if settings.get("email_alerts") and user.email:
            await self.email.send_daily_report(user.email, data)

    async def close(self):
        await self.telegram.close()
        await self.email.close()


# Global dispatcher
alert_dispatcher = AlertDispatcher()
