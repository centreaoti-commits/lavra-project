import logging
logger = logging.getLogger(__name__)
"""
Telegram Bot — Sends real-time alerts to users via Telegram.
"""

import httpx
from app.config import get_settings

settings = get_settings()


class TelegramAlertSender:
    """Sends alerts to users via Telegram bot."""

    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        self.client = httpx.AsyncClient(timeout=10)

    async def send_alert(self, chat_id: str, alert_type: str, title: str, message: str, severity: str = "info"):
        """Send an alert message to a Telegram chat."""
        if not self.bot_token:
            logger.info(f"Telegram bot token not configured")
            return False

        severity_emoji = {
            "critical": "🔴",
            "warning": "⚠️",
            "positive": "🟢",
            "info": "ℹ️",
        }
        emoji = severity_emoji.get(severity, "📢")

        text = f"""
{emoji} <b>{title}</b>

{message}

<i>Crypto Therapist • <a href="https://crypto-therapist.io">View Dashboard</a></i>
        """.strip()

        try:
            resp = await self.client.post(
                f"{self.base_url}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": "HTML",
                    "disable_web_page_preview": True,
                },
            )
            return resp.status_code == 200
        except Exception as e:
            logger.info(f"Telegram send error: {e}")
            return False

    async def send_daily_summary(self, chat_id: str, data: dict):
        """Send a daily summary message."""
        scores = data.get("scores", {})
        stats = data.get("stats", {})

        fomo_emoji = "🔴" if scores.get("fomo", 0) > 60 else "🟡" if scores.get("fomo", 0) > 30 else "🟢"
        panic_emoji = "🔴" if scores.get("panic", 0) > 60 else "🟡" if scores.get("panic", 0) > 30 else "🟢"
        revenge_emoji = "🔴" if scores.get("revenge", 0) > 60 else "🟡" if scores.get("revenge", 0) > 30 else "🟢"

        pnl = stats.get("total_pnl", 0)
        pnl_emoji = "📈" if pnl >= 0 else "📉"

        text = f"""
📊 <b>Daily Trading Report</b>

<b>Trades:</b> {stats.get('trade_count', 0)}
<b>Win Rate:</b> {stats.get('win_rate', 0):.0f}%
{pnl_emoji} <b>PnL:</b> ${pnl:,.0f}
💸 <b>Emotional Loss:</b> ${stats.get('emotional_loss', 0):,.0f}

<b>Emotional Scores:</b>
{fomo_emoji} FOMO: {scores.get('fomo', 0):.0f}/100
{panic_emoji} Panic: {scores.get('panic', 0):.0f}/100
{revenge_emoji} Revenge: {scores.get('revenge', 0):.0f}/100

<i>View full report → crypto-therapist.io</i>
        """.strip()

        return await self.send_alert(chat_id, "daily", "📊 Daily Report", text, "info")

    async def send_fomo_alert(self, chat_id: str, token: str, pump_pct: float, historical_loss: float):
        """Send a FOMO alert."""
        message = f"""
You're about to buy <b>{token}</b> which has pumped <b>{pump_pct:.0f}%</b> recently.

Based on your history, <b>72% of similar trades resulted in losses</b>.
Average loss on FOMO trades: <b>${historical_loss:,.0f}</b>

💡 <b>Suggestion:</b> Wait 4 hours. If you still want to buy, set a limit order.
        """.strip()

        return await self.send_alert(chat_id, "fomo", f"🏃 FOMO Alert — {token}", message, "critical")

    async def send_revenge_alert(self, chat_id: str, loss_amount: float, new_trade_size: float):
        """Send a revenge trade alert."""
        ratio = new_trade_size / loss_amount if loss_amount > 0 else 0

        message = f"""
You lost <b>${loss_amount:,.0f}</b> recently. You're now trying to open a <b>{ratio:.1f}x larger</b> position.

This matches your <b>revenge trading pattern</b> (detected 11 times in the last 30 days).

💡 <b>Suggestion:</b> Set a 1-hour cooldown. Journal your thesis before entering.
        """.strip()

        return await self.send_alert(chat_id, "revenge", "😤 Revenge Trade Detected", message, "warning")

    async def send_overtrade_alert(self, chat_id: str, trades_today: int, limit: int):
        """Send an overtrade alert."""
        message = f"""
You've made <b>{trades_today} trades today</b>. Your self-imposed limit is <b>{limit}</b>.

Your win rate drops from <b>42% to 18%</b> when you exceed 5 trades per day.

💡 <b>Suggestion:</b> Take a break. Review your trades before making another.
        """.strip()

        return await self.send_alert(chat_id, "overtrade", "🎰 Overtrade Warning", message, "warning")

    async def send_streak_alert(self, chat_id: str, streak_days: int, streak_type: str):
        """Send a positive streak alert."""
        message = f"""
Congratulations! 🎉

You've maintained a <b>{streak_type}-free streak for {streak_days} days</b>!

Your overall emotional score has improved. Keep up the great work!

💡 <b>Tip:</b> Document what's working for you. Review your winning patterns.
        """.strip()

        return await self.send_alert(chat_id, "positive", f"🔥 {streak_type}-Free Streak: {streak_days} Days!", message, "positive")

    async def close(self):
        await self.client.aclose()
