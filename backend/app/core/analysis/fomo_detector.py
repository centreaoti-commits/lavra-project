"""
FOMO Detector — Identifies trades driven by Fear Of Missing Out.

A trade is classified as FOMO when:
1. The token pumped significantly before the buy
2. The user bought near a local top
3. Position size was larger than usual
4. Short time between price move and execution
"""

from dataclasses import dataclass


@dataclass
class TradeContext:
    price_change_24h: float  # % change in 24h before trade
    distance_from_local_high: float  # % from local high
    volume_ratio: float  # current volume / avg volume
    user_avg_trade_size: float  # user's average trade size in USD
    minutes_since_price_move: float  # minutes since the pump started


@dataclass
class FOMOResult:
    score: float  # 0-100
    signals: dict
    reason: str


class FOMODetector:
    """Detects FOMO in trading behavior."""

    def calculate_fomo_score(self, trade_value_usd: float, context: TradeContext) -> FOMOResult:
        signals = {}
        total_score = 0

        # Signal 1: Price already pumped (weight: 35%)
        if context.price_change_24h > 30:
            signals["price_pump"] = 100
        elif context.price_change_24h > 15:
            signals["price_pump"] = 70
        elif context.price_change_24h > 8:
            signals["price_pump"] = 40
        elif context.price_change_24h > 3:
            signals["price_pump"] = 15
        else:
            signals["price_pump"] = 0
        total_score += signals["price_pump"] * 0.35

        # Signal 2: Bought near local high (weight: 25%)
        if context.distance_from_local_high < 3:
            signals["near_top"] = 100
        elif context.distance_from_local_high < 8:
            signals["near_top"] = 60
        elif context.distance_from_local_high < 15:
            signals["near_top"] = 30
        else:
            signals["near_top"] = 0
        total_score += signals["near_top"] * 0.25

        # Signal 3: Volume spike (weight: 15%)
        if context.volume_ratio > 5:
            signals["volume"] = 100
        elif context.volume_ratio > 3:
            signals["volume"] = 70
        elif context.volume_ratio > 2:
            signals["volume"] = 40
        else:
            signals["volume"] = 0
        total_score += signals["volume"] * 0.15

        # Signal 4: Oversized position (weight: 15%)
        if context.user_avg_trade_size > 0:
            size_ratio = trade_value_usd / context.user_avg_trade_size
        else:
            size_ratio = 1

        if size_ratio > 3:
            signals["size"] = 100
        elif size_ratio > 2:
            signals["size"] = 60
        elif size_ratio > 1.5:
            signals["size"] = 30
        else:
            signals["size"] = 0
        total_score += signals["size"] * 0.15

        # Signal 5: Speed of execution (weight: 10%)
        if context.minutes_since_price_move < 30:
            signals["speed"] = 100
        elif context.minutes_since_price_move < 120:
            signals["speed"] = 50
        elif context.minutes_since_price_move < 360:
            signals["speed"] = 20
        else:
            signals["speed"] = 0
        total_score += signals["speed"] * 0.10

        final_score = min(100, max(0, total_score))

        # Generate reason
        reasons = []
        if signals["price_pump"] > 50:
            reasons.append(f"token pumped {context.price_change_24h:.0f}% before your buy")
        if signals["near_top"] > 50:
            reasons.append(f"you bought within {context.distance_from_local_high:.0f}% of the local high")
        if signals["speed"] > 50:
            reasons.append(f"you reacted within {context.minutes_since_price_move:.0f} minutes")

        reason = "FOMO detected: " + ", ".join(reasons) if reasons else "No significant FOMO signals"

        return FOMOResult(
            score=round(final_score, 1),
            signals=signals,
            reason=reason,
        )
