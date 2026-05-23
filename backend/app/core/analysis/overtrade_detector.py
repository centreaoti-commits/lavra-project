"""
Overtrade Detector — Identifies compulsive/unnecessary trading.

Key signals:
1. Number of trades per day/week
2. Trades without clear thesis (random tokens)
3. Trading during off-hours (insomnia trading)
4. Decreasing win rate with increasing frequency
"""

from dataclasses import dataclass


@dataclass
class OvertradeContext:
    trades_today: int
    trades_this_week: int
    user_avg_trades_per_day: float
    unique_tokens_today: int
    hour_of_day: int  # 0-23
    win_rate_at_high_frequency: float  # win rate when trading >5/day
    win_rate_at_low_frequency: float  # win rate when trading <=3/day


@dataclass
class OvertradeResult:
    score: float  # 0-100
    signals: dict
    trades_today: int
    reason: str


class OvertradeDetector:
    """Detects overtrading behavior."""

    def check_overtrade(self, context: OvertradeContext) -> OvertradeResult:
        signals = {}
        total_score = 0

        # Signal 1: Daily trade count (weight: 35%)
        if context.trades_today > 10:
            signals["daily_count"] = 100
        elif context.trades_today > 7:
            signals["daily_count"] = 80
        elif context.trades_today > 5:
            signals["daily_count"] = 60
        elif context.trades_today > 3:
            signals["daily_count"] = 30
        else:
            signals["daily_count"] = 0
        total_score += signals["daily_count"] * 0.35

        # Signal 2: Weekly trade count (weight: 20%)
        if context.trades_this_week > 40:
            signals["weekly_count"] = 100
        elif context.trades_this_week > 25:
            signals["weekly_count"] = 70
        elif context.trades_this_week > 15:
            signals["weekly_count"] = 40
        else:
            signals["weekly_count"] = 0
        total_score += signals["weekly_count"] * 0.20

        # Signal 3: Token hopping (weight: 20%)
        if context.unique_tokens_today > 6:
            signals["token_hopping"] = 100
        elif context.unique_tokens_today > 4:
            signals["token_hopping"] = 60
        elif context.unique_tokens_today > 2:
            signals["token_hopping"] = 30
        else:
            signals["token_hopping"] = 0
        total_score += signals["token_hopping"] * 0.20

        # Signal 4: Off-hours trading (weight: 10%)
        if context.hour_of_day in [0, 1, 2, 3, 4, 5]:
            signals["off_hours"] = 80  # Late night/early morning
        elif context.hour_of_day in [23]:
            signals["off_hours"] = 50
        else:
            signals["off_hours"] = 0
        total_score += signals["off_hours"] * 0.10

        # Signal 5: Win rate degradation (weight: 15%)
        if context.win_rate_at_high_frequency > 0 and context.win_rate_at_low_frequency > 0:
            degradation = context.win_rate_at_low_frequency - context.win_rate_at_high_frequency
            if degradation > 30:
                signals["win_rate_drop"] = 100
            elif degradation > 20:
                signals["win_rate_drop"] = 70
            elif degradation > 10:
                signals["win_rate_drop"] = 40
            else:
                signals["win_rate_drop"] = 0
        else:
            signals["win_rate_drop"] = 0
        total_score += signals["win_rate_drop"] * 0.15

        final_score = min(100, max(0, total_score))

        reasons = []
        if signals["daily_count"] > 50:
            reasons.append(f"{context.trades_today} trades today (avg: {context.user_avg_trades_per_day:.1f})")
        if signals["token_hopping"] > 50:
            reasons.append(f"{context.unique_tokens_today} different tokens today")
        if signals["off_hours"] > 50:
            reasons.append(f"trading at {context.hour_of_day}:00 (off-hours)")
        if signals["win_rate_drop"] > 50:
            reasons.append("win rate drops significantly at high frequency")

        reason = "Overtrading: " + ", ".join(reasons) if reasons else "Trading frequency is healthy"

        return OvertradeResult(
            score=round(final_score, 1),
            signals=signals,
            trades_today=context.trades_today,
            reason=reason,
        )
