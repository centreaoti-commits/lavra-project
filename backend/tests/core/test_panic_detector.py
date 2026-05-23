"""
Tests for the Panic Detector.
"""

from app.core.analysis.panic_detector import PanicDetector, PanicContext


class TestPanicDetector:
    def setup_method(self):
        self.detector = PanicDetector()

    def test_high_panic_score(self):
        """Test that a big loss with short hold triggers panic."""
        context = PanicContext(
            price_drop_since_entry=35,
            hold_duration_minutes=15,  # Only held 15 minutes
            is_market_dropping=True,
            volume_spike=6,
            token_trend_7d=15,  # Token was in uptrend
            user_avg_hold_time=1440,
        )

        result = self.detector.detect_panic_sell(-35, context)

        assert result.score > 70
        assert "sold at" in result.reason.lower() or "panic" in result.reason.lower()

    def test_no_panic_on_profit(self):
        """Test that profitable sells are never panic."""
        context = PanicContext(
            price_drop_since_entry=-20,  # It went UP
            hold_duration_minutes=60,
            is_market_dropping=False,
            volume_spike=1,
            token_trend_7d=20,
            user_avg_hold_time=1000,
        )

        result = self.detector.detect_panic_sell(20, context)

        assert result.score == 0

    def test_panic_below_trend(self):
        """Test selling below long-term trend increases panic score."""
        context = PanicContext(
            price_drop_since_entry=15,
            hold_duration_minutes=120,
            is_market_dropping=False,
            volume_spike=2,
            token_trend_7d=25,  # Token up 25% on 7d but user sold at -15%
            user_avg_hold_time=1000,
        )

        result = self.detector.detect_panic_sell(-15, context)

        assert result.signals.get("below_trend", 0) > 50

    def test_small_loss_long_hold(self):
        """Test that small loss after long hold is NOT panic."""
        context = PanicContext(
            price_drop_since_entry=5,
            hold_duration_minutes=10080,  # 7 days
            is_market_dropping=False,
            volume_spike=1,
            token_trend_7d=-5,
            user_avg_hold_time=2000,
        )

        result = self.detector.detect_panic_sell(-5, context)

        assert result.score < 30
