"""
Revenge Trade Detector — Identifies trading to recover losses emotionally.

Key signals:
1. Time since last loss (shorter = more emotional)
2. New trade size vs loss (bigger = trying to recover)
3. Token change (switching to different asset = impulsive)
4. Repeated pattern frequency
"""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class RecentLoss:
    timestamp: datetime
    pnl_usd: float  # negative
    token: str


@dataclass
class RevengeResult:
    score: float  # 0-100
    gap_minutes: float
    size_ratio: float
    loss_amount: float
    token_switched: bool
    pattern_frequency: int
    reason: str


class RevengeDetector:
    """Detects revenge trading behavior."""

    def detect_revenge_trade(
        self,
        current_value_usd: float,
        current_token: str,
        current_time: datetime,
        recent_losses: list[RecentLoss],
        revenge_count_30d: int,
    ) -> RevengeResult:
        # Find most recent loss within 4 hours
        recent_loss = None
        for loss in recent_losses:
            gap = (current_time - loss.timestamp).total_seconds() / 60
            if gap < 240:  # 4 hours
                recent_loss = loss
                break

        if not recent_loss:
            return RevengeResult(
                score=0, gap_minutes=0, size_ratio=0, loss_amount=0,
                token_switched=False, pattern_frequency=revenge_count_30d,
                reason="No recent loss — not revenge trading"
            )

        gap_minutes = (current_time - recent_loss.timestamp).total_seconds() / 60
        abs_loss = abs(recent_loss.pnl_usd)
        size_ratio = current_value_usd / abs_loss if abs_loss > 0 else 0
        token_switched = current_token != recent_loss.token

        score = 0

        # Time component (0-40 points)
        if gap_minutes < 15:
            score += 40
        elif gap_minutes < 30:
            score += 30
        elif gap_minutes < 60:
            score += 20
        elif gap_minutes < 120:
            score += 10

        # Size amplification (0-30 points)
        if size_ratio > 3:
            score += 30
        elif size_ratio > 2:
            score += 20
        elif size_ratio > 1.5:
            score += 10

        # Token switch (0-15 points)
        if token_switched:
            score += 15

        # Pattern frequency (0-15 points)
        if revenge_count_30d > 5:
            score += 15
        elif revenge_count_30d > 2:
            score += 10
        elif revenge_count_30d > 0:
            score += 5

        final_score = min(100, score)

        reasons = []
        if gap_minutes < 60:
            reasons.append(f"only {gap_minutes:.0f} min after ${abs_loss:.0f} loss")
        if size_ratio > 2:
            reasons.append(f"trade size is {size_ratio:.1f}x the loss amount")
        if token_switched:
            reasons.append("switched to different token (impulsive)")
        if revenge_count_30d > 2:
            reasons.append(f"{revenge_count_30d} revenge patterns in last 30 days")

        reason = "Revenge trade: " + ", ".join(reasons) if reasons else "No revenge signals"

        return RevengeResult(
            score=round(final_score, 1),
            gap_minutes=round(gap_minutes, 1),
            size_ratio=round(size_ratio, 2),
            loss_amount=round(abs_loss, 2),
            token_switched=token_switched,
            pattern_frequency=revenge_count_30d,
            reason=reason,
        )
