"""
Diamond Hands Scorer — Measures conviction holding ability.

Positive trait: ability to hold through volatility.
Bags: holding losing positions out of denial.
We need to distinguish between the two.
"""

from dataclasses import dataclass


@dataclass
class DiamondHandsContext:
    hold_duration_minutes: int
    pnl_percent: float
    max_drawdown_during_hold: float  # biggest drop during hold period
    recovery_after_drawdown: float  # did it recover?
    user_avg_hold_time: int
    is_profitable: bool


@dataclass
class DiamondHandsResult:
    score: float  # 0-100 (high = good diamond hands)
    is_bag_holding: bool
    signals: dict
    reason: str


class DiamondHandsScorer:
    """Scores diamond hands ability vs bag holding."""

    def score_diamond_hands(self, context: DiamondHandsContext) -> DiamondHandsResult:
        signals = {}
        total_score = 0

        # Determine if this is diamond hands or bag holding
        is_bag_holding = (
            not context.is_profitable
            and context.hold_duration_minutes > 10080  # 7 days
            and context.pnl_percent < -30
        )

        # Signal 1: Hold duration vs user average (weight: 25%)
        if context.user_avg_hold_time > 0:
            hold_ratio = context.hold_duration_minutes / context.user_avg_hold_time
        else:
            hold_ratio = 1

        if hold_ratio > 3:
            signals["hold_duration"] = 100
        elif hold_ratio > 2:
            signals["hold_duration"] = 70
        elif hold_ratio > 1.5:
            signals["hold_duration"] = 40
        else:
            signals["hold_duration"] = 0
        total_score += signals["hold_duration"] * 0.25

        # Signal 2: Holding through drawdown (weight: 30%)
        if context.max_drawdown_during_hold > 30:
            signals["drawdown_hold"] = 100  # Held through 30%+ drop
        elif context.max_drawdown_during_hold > 20:
            signals["drawdown_hold"] = 70
        elif context.max_drawdown_during_hold > 10:
            signals["drawdown_hold"] = 40
        else:
            signals["drawdown_hold"] = 0
        total_score += signals["drawdown_hold"] * 0.30

        # Signal 3: Profitability (weight: 25%)
        if context.is_profitable:
            if context.pnl_percent > 50:
                signals["profit"] = 100
            elif context.pnl_percent > 20:
                signals["profit"] = 70
            elif context.pnl_percent > 5:
                signals["profit"] = 40
            else:
                signals["profit"] = 10
        else:
            signals["profit"] = 0
        total_score += signals["profit"] * 0.25

        # Signal 4: Recovery witnessed (weight: 20%)
        if context.recovery_after_drawdown > 20:
            signals["recovery"] = 100  # Saw 20%+ recovery
        elif context.recovery_after_drawdown > 10:
            signals["recovery"] = 60
        elif context.recovery_after_drawdown > 0:
            signals["recovery"] = 30
        else:
            signals["recovery"] = 0
        total_score += signals["recovery"] * 0.20

        final_score = min(100, max(0, total_score))

        # Reduce score if bag holding
        if is_bag_holding:
            final_score = max(0, final_score - 30)

        reasons = []
        if is_bag_holding:
            reasons.append(f"WARNING: likely bag holding — down {abs(context.pnl_percent):.1f}% over {context.hold_duration_minutes // 1440} days")
        if signals["drawdown_hold"] > 50 and context.is_profitable:
            reasons.append(f"held through {context.max_drawdown_during_hold:.0f}% drawdown and recovered")
        if signals["hold_duration"] > 50:
            reasons.append(f"held {hold_ratio:.1f}x longer than your average")
        if context.is_profitable and context.pnl_percent > 20:
            reasons.append(f"conviction paid off: +{context.pnl_percent:.1f}%")

        reason = "; ".join(reasons) if reasons else "Average hold behavior"

        return DiamondHandsResult(
            score=round(final_score, 1),
            is_bag_holding=is_bag_holding,
            signals=signals,
            reason=reason,
        )
