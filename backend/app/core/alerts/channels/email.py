import logging
logger = logging.getLogger(__name__)
"""
Email Alert Sender — Sends alerts via SendGrid.
"""

import httpx
from app.config import get_settings

settings = get_settings()


class EmailAlertSender:
    """Sends alerts via email using SendGrid API."""

    def __init__(self):
        self.api_key = settings.SENDGRID_API_KEY
        self.from_email = settings.FROM_EMAIL
        self.client = httpx.AsyncClient(timeout=10)

    async def send_alert(self, to_email: str, subject: str, html_content: str):
        """Send an email alert."""
        if not self.api_key:
            logger.info(f"SendGrid API key not configured")
            return False

        try:
            resp = await self.client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to_email}]}],
                    "from": {"email": self.from_email, "name": "Crypto Therapist"},
                    "subject": subject,
                    "content": [{"type": "text/html", "value": html_content}],
                },
            )
            return resp.status_code in [200, 202]
        except Exception as e:
            logger.info(f"Email send error: {e}")
            return False

    async def send_daily_report(self, to_email: str, data: dict):
        """Send a daily report email."""
        scores = data.get("scores", {})
        stats = data.get("stats", {})
        personality = data.get("personality", {})
        insights = data.get("insights", [])

        insights_html = "\n".join(f"<li>{i}</li>" for i in insights)

        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #f1f5f9; padding: 32px; border-radius: 16px;">
            <h1 style="color: #8b5cf6;">📊 Daily Trading Report</h1>

            <div style="background: #12121a; padding: 20px; border-radius: 12px; margin: 16px 0;">
                <h2 style="margin-top: 0;">Your Personality: {personality.get('name', 'Unknown')}</h2>
                <p><strong>Trades:</strong> {stats.get('trade_count', 0)}</p>
                <p><strong>Win Rate:</strong> {stats.get('win_rate', 0):.0f}%</p>
                <p><strong>Net PnL:</strong> ${stats.get('total_pnl', 0):,.0f}</p>
                <p><strong>Emotional Loss:</strong> ${stats.get('emotional_loss', 0):,.0f}</p>
            </div>

            <div style="background: #12121a; padding: 20px; border-radius: 12px; margin: 16px 0;">
                <h3 style="margin-top: 0;">Emotional Scores</h3>
                <p>🏃 FOMO: {scores.get('fomo', 0):.0f}/100</p>
                <p>😱 Panic: {scores.get('panic', 0):.0f}/100</p>
                <p>😤 Revenge: {scores.get('revenge', 0):.0f}/100</p>
                <p>🎰 Overtrade: {scores.get('overtrade', 0):.0f}/100</p>
                <p>💎 Diamond Hands: {scores.get('diamond_hands', 0):.0f}/100</p>
            </div>

            <div style="background: #12121a; padding: 20px; border-radius: 12px; margin: 16px 0;">
                <h3 style="margin-top: 0;">Key Insights</h3>
                <ul style="padding-left: 20px;">
                    {insights_html}
                </ul>
            </div>

            <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px;">
                <a href="https://crypto-therapist.io/dashboard" style="color: #8b5cf6;">View Full Dashboard →</a>
            </p>
        </div>
        """

        return await self.send_alert(
            to_email,
            f"📊 Daily Report — {personality.get('name', 'Your Trading')}",
            html,
        )

    async def close(self):
        await self.client.aclose()
