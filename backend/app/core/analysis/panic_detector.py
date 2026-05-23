"""
Panic Sell Detector — Identifies sells driven by panic/fear.

Key signals:
1. Selling during significant price drop
2. Selling at a loss after short hold time
3. Selling below entry despite positive long-term trend
4. Selling during high-volume dump (capitulation)
"""

from dataclasses import dataclass


@dataclass
class PanicContext:
    price_drop_since_entry: float  # % drop from entry price
    hold_duration_minutes: int
    is_market_dropping: bool  # overall market is down
    volume_spike: float  # volume ratio (current / avg)
    token_trend_7d: float  # 7-day trend (%)
    user_avg_hold_time: int  # user's average hold time in minutes


@dataclass
class PanicResult:
    score: float  # 0-100
    signals: dict
    reason: str


class PanicDetector:
    """Detects panic selling behavior."""

    def detect_panic_sell(self, pnl_percent: float, context: PanicContext) -> PanicResult:
        signals = {}
        total_score = 0

        # Only applies to sells at a loss
        if pnl_percent >= 0:
            return PanicResult(score=0, signals={}, reason="Not a loss — not panic selling")

        # Signal 1: Large loss (weight: 30%)
        abs_loss = abs(pnl_percent)
        if abs_loss > 30:
            signals["loss_size"] = 100
        elif abs_loss > 20:
            signals["loss_size"] = 70
        elif abs_loss > 10:
            signals["loss_size"] = 40
        elif abs_loss > 5:
            signals["loss_size"] = 20
        else:
            signals["loss_size"] = 0
        total_score += signals["loss_size"] * 0.30

        # Signal 2: Short hold time (weight: 25%)
        if context.hold_duration_minutes < 30:
            signals["hold_time"] = 100
        elif context.hold_duration_minutes < 120:
            signals["hold_time"] = 70
        elif context.hold_duration_minutes < 1440:  # 24h
            signals["hold_time"] = 40
        else:
            signals["hold_time"] = 0
        total_score += signals["hold_time"] * 0.25

        # Signal 3: Market-wide dump (weight: 15%)
        if context.is_market_dropping:
            signals["market_dump"] = 80
        else:
            signals["market_dump"] = 0
        total_score += signals["market_dump"] * 0.15

        # Signal 4: Volume spike (selling into panic volume) (weight: 15%)
        if context.volume_spike > 5:
            signals["volume"] = 100
        elif context.volume_spike > 3:
            signals["volume"] = 60
        elif context.volume_spike > 2:
            signals["volume"] = 30
        else:
            signals["volume"] = 0
        total_score += signals["volume"] * 0.15

        # Signal 5: Selling below long-term trend (weight: 15%)
        if context.token_trend_7d > 10 and pnl_percent < -10:
            signals["below_trend"] = 100  # Token is in uptrend but user sold at loss
        elif context.token_trend_7d > 5 and pnl_percent < -5:
            signals["below_trend"] = 60
        else:
            signals["below_trend"] = 0
        total_score += signals["below_trend"] * 0.15

        final_score = min(100, max(0, total_score))

        # Generate reason
        reasons = []
        if signals["loss_size"] > 40:
            reasons.append(f"sold at {abs_loss:.1f}% loss")
        if signals["hold_time"] > 40:
            reasons.append(f"held only {context.hold_duration_minutes} minutes")
        if signals["market_dump"] > 50:
            reasons.append("during market-wide dump")
        if signals["below_trend"] > 50:
            reasons.append(f"token is up {context.token_trend_7d:.0f}% on 7d trend — sold too early")

        reason = "Panic sell detected: " + ", ".join(reasons) if reasons else "No panic signals"

        return PanicResult(score=round(final_score, 1), signals=signals, reason=reason)
