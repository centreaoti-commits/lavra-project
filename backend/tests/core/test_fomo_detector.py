"""
Tests for the FOMO Detector.
"""

from app.core.analysis.fomo_detector import FOMODetector, TradeContext

class TestFOMODetector:
    def setup_method(self):
        self.detector = FOMODetector()

    def test_high_fomo_score(self):
        """Test that a trade with high FOMO signals gets a high score."""
        context = TradeContext(
            price_change_24h=35,  # Token pumped 35%
            distance_from_local_high=2,  # Bought within 2% of top
            volume_ratio=6,  # 6x normal volume
            user_avg_trade_size=1000,
            minutes_since_price_move=15,  # Reacted within 15 min
        )

        result = self.detector.calculate_fomo_score(2000, context)

        assert result.score > 70
        assert result.signals["price_pump"] == 100
        assert result.signals["near_top"] == 100
        assert result.signals["speed"] == 100
        assert "pumped" in result.reason.lower() or "FOMO" in result.reason

    def test_low_fomo_score(self):
        """Test that a normal trade doesn't trigger FOMO."""
        context = TradeContext(
            price_change_24h=2,  # Only 2% change
            distance_from_local_high=30,  # Far from top
            volume_ratio=1,  # Normal volume
            user_avg_trade_size=1000,
            minutes_since_price_move=1440,  # 24 hours later
        )

        result = self.detector.calculate_fomo_score(500, context)

        assert result.score < 30
        assert "No significant" in result.reason

    def test_oversized_position(self):
        """Test that oversized positions increase FOMO score."""
        context = TradeContext(
            price_change_24h=12,
            distance_from_local_high=10,
            volume_ratio=2,
            user_avg_trade_size=500,
            minutes_since_price_move=60,
        )

        # Trade 4x larger than average
        result = self.detector.calculate_fomo_score(2000, context)

        assert result.signals["size"] == 100

    def test_score_clamped_to_100(self):
        """Test that score never exceeds 100."""
        context = TradeContext(
            price_change_24h=100,
            distance_from_local_high=0,
            volume_ratio=20,
            user_avg_trade_size=100,
            minutes_since_price_move=1,
        )

        result = self.detector.calculate_fomo_score(10000, context)

        assert result.score <= 100

    def test_score_never_negative(self):
        """Test that score is never negative."""
        context = TradeContext(
            price_change_24h=-10,  # Price dropped
            distance_from_local_high=50,
            volume_ratio=0.5,
            user_avg_trade_size=1000,
            minutes_since_price_move=10000,
        )

        result = self.detector.calculate_fomo_score(100, context)

        assert result.score >= 0
