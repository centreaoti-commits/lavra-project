"""
Tests for the Personality Engine.
"""

from app.core.analysis.personality import (
    PersonalityEngine,
    EmotionalScores,
    TradePatterns,
)


class TestPersonalityEngine:
    def setup_method(self):
        self.engine = PersonalityEngine()

    def test_fomo_trader(self):
        """Test that high FOMO score assigns FOMO trader archetype."""
        scores = EmotionalScores(
            fomo=80, panic=30, revenge=20, overtrade=25, diamond_hands=40, overall=50
        )
        patterns = TradePatterns(
            avg_hold_time_days=3, trades_per_month=15, win_rate=35,
            avg_trade_size=1000, unique_tokens_ratio=0.3,
        )

        result = self.engine.assign_archetype(scores, patterns)

        assert result.key == "reactive_fomo"
        assert "FOMO" in result.name

    def test_panic_seller(self):
        """Test that high panic score assigns panic seller archetype."""
        scores = EmotionalScores(
            fomo=30, panic=75, revenge=20, overtrade=25, diamond_hands=20, overall=45
        )
        patterns = TradePatterns(
            avg_hold_time_days=1, trades_per_month=20, win_rate=30,
            avg_trade_size=800, unique_tokens_ratio=0.4,
        )

        result = self.engine.assign_archetype(scores, patterns)

        assert result.key == "panic_seller"
        assert "Panic" in result.name

    def test_revenge_warrior(self):
        """Test that high revenge score assigns revenge warrior."""
        scores = EmotionalScores(
            fomo=40, panic=35, revenge=70, overtrade=30, diamond_hands=30, overall=50
        )
        patterns = TradePatterns(
            avg_hold_time_days=2, trades_per_month=25, win_rate=35,
            avg_trade_size=1500, unique_tokens_ratio=0.5,
        )

        result = self.engine.assign_archetype(scores, patterns)

        assert result.key == "revenge_warrior"

    def test_diamond_hands(self):
        """Test that high diamond hands assigns diamond hands archetype."""
        scores = EmotionalScores(
            fomo=20, panic=15, revenge=10, overtrade=20, diamond_hands=85, overall=20
        )
        patterns = TradePatterns(
            avg_hold_time_days=14, trades_per_month=5, win_rate=65,
            avg_trade_size=2000, unique_tokens_ratio=0.2,
        )

        result = self.engine.assign_archetype(scores, patterns)

        assert result.key == "diamond_hands"
        assert "Diamond" in result.name

    def test_cold_calculator(self):
        """Test that all-low scores assigns cold calculator."""
        scores = EmotionalScores(
            fomo=15, panic=20, revenge=10, overtrade=15, diamond_hands=50, overall=20
        )
        patterns = TradePatterns(
            avg_hold_time_days=7, trades_per_month=8, win_rate=55,
            avg_trade_size=1500, unique_tokens_ratio=0.3,
        )

        result = self.engine.assign_archetype(scores, patterns)

        assert result.key == "cold_calculator"

    def test_overtrade_slot_machine(self):
        """Test that very high overtrade assigns slot machine."""
        scores = EmotionalScores(
            fomo=40, panic=30, revenge=25, overtrade=80, diamond_hands=20, overall=45
        )
        patterns = TradePatterns(
            avg_hold_time_days=0.5, trades_per_month=50, win_rate=25,
            avg_trade_size=500, unique_tokens_ratio=0.8,
        )

        result = self.engine.assign_archetype(scores, patterns)

        assert result.key == "slot_machine"

    def test_mixed_profile(self):
        """Test that balanced scores assigns mixed profile."""
        scores = EmotionalScores(
            fomo=45, panic=40, revenge=35, overtrade=40, diamond_hands=45, overall=40
        )
        patterns = TradePatterns(
            avg_hold_time_days=4, trades_per_month=12, win_rate=42,
            avg_trade_size=1000, unique_tokens_ratio=0.4,
        )

        result = self.engine.assign_archetype(scores, patterns)

        assert result.key == "mixed"
