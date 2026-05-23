"""
AI Trading Coach — LLM-powered personalized coaching via Gitlawb.
Uses httpx directly to avoid openai client connection issues with custom gateways.
"""

import httpx
import json
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

SYSTEM_PROMPT = """You are a crypto trading psychologist and coach. You help traders understand and improve their emotional trading patterns.

You have access to this user's behavioral analysis:

PERSONALITY: {archetype_name} {archetype_emoji}
DESCRIPTION: {archetype_description}

EMOTIONAL SCORES (0-100, lower is better except Diamond Hands):
- FOMO: {fomo_score} {fomo_emoji}
- Panic Selling: {panic_score} {panic_emoji}
- Revenge Trading: {revenge_score} {revenge_emoji}
- Overtrading: {overtrade_score} {overtrade_emoji}
- Diamond Hands: {diamond_hands_score} {diamond_emoji}

KEY PATTERNS DETECTED:
{patterns_list}

STATS:
- Total Trades: {total_trades}
- Win Rate: {win_rate}%
- Total PnL: ${total_pnl}
- Estimated Emotional Loss: ${emotional_loss}
- Average Hold Time: {avg_hold_time}

RULES:
1. Always reference SPECIFIC data from their history
2. Use exact numbers
3. Be direct but empathetic — don't sugarcoat, don't be harsh
4. Give actionable advice with concrete next steps
5. Celebrate improvements genuinely
6. When they ask "what should I do", give analysis not financial advice
7. Never tell them to buy/sell specific tokens
8. Focus on PROCESS improvement, not profit
9. Keep responses concise (2-4 paragraphs max)
10. If they seem emotional, prioritize calming over analysis
"""


class AICoach:
    """LLM-powered trading coach via Gitlawb gateway."""

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=60.0,
            headers={
                "Accept-Encoding": "identity",
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
        )
        self.base_url = settings.AI_BASE_URL
        self.model = settings.AI_MODEL

    async def get_response(
        self,
        user_message: str,
        analysis_data: dict,
        chat_history: list[dict],
    ) -> str:
        """Generate AI coach response based on user's analysis data."""
        system = self._build_system_prompt(analysis_data)

        messages = [{"role": "system", "content": system}]
        for msg in chat_history[-20:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        try:
            resp = await self.client.post(
                f"{self.base_url}/chat/completions",
                json={
                    "model": self.model,
                    "messages": messages,
                    "max_tokens": 800,
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            msg = data["choices"][0]["message"]
            # Handle reasoning models (content may be null, use reasoning_content)
            return msg.get("content") or msg.get("reasoning_content", "I couldn't generate a response.")
        except Exception as e:
            logger.error(f"AI Coach error: {e}")
            return f"I'm having trouble connecting right now. Please try again in a moment."

    def _build_system_prompt(self, data: dict) -> str:
        scores = data.get("scores", {})
        personality = data.get("personality", {})
        stats = data.get("stats", {})

        def score_emoji(score: float) -> str:
            if score <= 30: return "🟢"
            if score <= 60: return "🟡"
            return "🔴"

        patterns = data.get("insights", [])
        patterns_text = "\n".join(f"- {p}" for p in patterns) if patterns else "- No significant patterns detected yet"

        return SYSTEM_PROMPT.format(
            archetype_name=personality.get("name", "Unknown"),
            archetype_emoji=personality.get("emoji", "❓"),
            archetype_description=personality.get("description", ""),
            fomo_score=scores.get("fomo", 0),
            fomo_emoji=score_emoji(scores.get("fomo", 0)),
            panic_score=scores.get("panic", 0),
            panic_emoji=score_emoji(scores.get("panic", 0)),
            revenge_score=scores.get("revenge", 0),
            revenge_emoji=score_emoji(scores.get("revenge", 0)),
            overtrade_score=scores.get("overtrade", 0),
            overtrade_emoji=score_emoji(scores.get("overtrade", 0)),
            diamond_hands_score=scores.get("diamond_hands", 0),
            diamond_emoji=score_emoji(scores.get("diamond_hands", 0)),
            patterns_list=patterns_text,
            total_trades=stats.get("total_trades", 0),
            win_rate=stats.get("win_rate", 0),
            total_pnl=stats.get("total_pnl", 0),
            emotional_loss=stats.get("emotional_loss", 0),
            avg_hold_time=stats.get("avg_hold_time", "N/A"),
        )
