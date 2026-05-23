"""
Tests for the Revenge Detector.
"""

from datetime import datetime, timedelta
from app.core.analysis.revenge_detector import RevengeDetector, RecentLoss


class TestRevengeDetector:
    def setup_method(self):
        self.detector = RevengeDetector()

    def test_high_revenge_score(self):
        """Test that a trade right after a big loss is flagged as revenge."""
        now = datetime.utcnow()
        recent_losses = [
            RecentLoss(
                timestamp=now - timedelta(minutes=20),
                pnl_usd=-500,
                token="ETH",
            )
        ]

        result = self.detector.detect_revenge_trade(
            current_value_usd=2000,
            current_token="SOL",  # Different token = more impulsive
            current_time=now,
            recent_losses=recent_losses,
            revenge_count_30d=3,
        )

        assert result.score > 60
        assert result.token_switched == True
        assert result.gap_minutes < 30

    def test_no_revenge_after_long_gap(self):
        """Test that trades hours after a loss aren't flagged."""
        now = datetime.utcnow()
        recent_losses = [
            RecentLoss(
                timestamp=now - timedelta(hours=5),
                pnl_usd=-200,
                token="ETH",
            )
        ]

        result = self.detector.detect_revenge_trade(
            current_value_usd=500,
            current_token="ETH",
            current_time=now,
            recent_losses=recent_losses,
            revenge_count_30d=0,
        )

        assert result.score == 0

    def test_larger_trade_after_loss(self):
        """Test that a much larger trade after a loss triggers revenge."""
        now = datetime.utcnow()
        recent_losses = [
            RecentLoss(
                timestamp=now - timedelta(minutes=10),
                pnl_usd=-100,
                token="PEPE",
            )
        ]

        result = self.detector.detect_revenge_trade(
            current_value_usd=500,  # 5x the loss
            current_token="DOGE",
            current_time=now,
            recent_losses=recent_losses,
            revenge_count_30d=0,
        )

        assert result.size_ratio > 3
        assert result.score > 40

    def test_pattern_frequency_adds_score(self):
        """Test that repeated revenge patterns increase the score."""
        now = datetime.utcnow()
        recent_losses = [
            RecentLoss(
                timestamp=now - timedelta(minutes=30),
                pnl_usd=-200,
                token="ETH",
            )
        ]

        result = self.detector.detect_revenge_trade(
            current_value_usd=600,
            current_token="ETH",
            current_time=now,
            recent_losses=recent_losses,
            revenge_count_30d=8,  # 8 revenge trades in 30 days
        )

        assert result.pattern_frequency == 8
