"""
Personality Engine — Assigns trading personality archetype based on
emotional scores and behavioral patterns.
"""

from dataclasses import dataclass


@dataclass
class EmotionalScores:
    fomo: float
    panic: float
    revenge: float
    overtrade: float
    diamond_hands: float
    overall: float


@dataclass
class TradePatterns:
    avg_hold_time_days: float
    trades_per_month: float
    win_rate: float
    avg_trade_size: float
    unique_tokens_ratio: float  # unique tokens / total trades


@dataclass
class ArchetypeResult:
    key: str
    name: str
    emoji: str
    description: str
    coaching_focus: str
    confidence: float


ARCHETYPES = {
    "reactive_fomo": {
        "name": "Reactive FOMO Trader",
        "emoji": "🏃",
        "description": "You tend to buy after price pumps, driven by fear of missing out on gains. Your biggest weakness is patience — you see green and can't resist.",
        "coaching_focus": "patience_and_limit_orders",
    },
    "panic_seller": {
        "name": "Panic Seller",
        "emoji": "😱",
        "description": "You sell during dips, unable to withstand short-term volatility. Your biggest weakness is conviction — you can't hold through red.",
        "coaching_focus": "conviction_and_position_sizing",
    },
    "revenge_warrior": {
        "name": "Revenge Warrior",
        "emoji": "😤",
        "description": "You trade aggressively after losses, trying to recover quickly. Your biggest weakness is emotional control — losses trigger irrational decisions.",
        "coaching_focus": "cooling_off_and_journaling",
    },
    "slot_machine": {
        "name": "Slot Machine Gambler",
        "emoji": "🎰",
        "description": "You trade compulsively without clear strategy. Your biggest weakness is discipline — you treat trading like gambling.",
        "coaching_focus": "strategy_and_discipline",
    },
    "diamond_hands": {
        "name": "Diamond Hands",
        "emoji": "💎",
        "description": "You hold conviction through volatility — a great trait! But you may need better exit timing to lock in profits.",
        "coaching_focus": "exit_strategy",
    },
    "cold_calculator": {
        "name": "Cold Calculator",
        "emoji": "🧊",
        "description": "You trade systematically with low emotional influence. You're already doing well — focus on fine-tuning your edge.",
        "coaching_focus": "fine_tuning",
    },
    "butterfly": {
        "name": "Butterfly",
        "emoji": "🦋",
        "description": "You jump between tokens constantly, lacking focus. Your biggest weakness is conviction — you can't stick with a position.",
        "coaching_focus": "conviction_and_research",
    },
    "slow_steady": {
        "name": "Slow & Steady",
        "emoji": "🐢",
        "description": "You trade carefully and infrequently. Confidence could be your growth area — don't be afraid to size up on high-conviction plays.",
        "coaching_focus": "confidence_and_scaling",
    },
}


class PersonalityEngine:
    """Assigns trading personality archetype."""

    def assign_archetype(
        self, scores: EmotionalScores, patterns: TradePatterns
    ) -> ArchetypeResult:
        # Priority-ordered checks
        if scores.revenge > 55:
            return self._build_result("revenge_warrior", scores)

        if scores.fomo > 65 and scores.panic < 50:
            return self._build_result("reactive_fomo", scores)

        if scores.panic > 65 and scores.diamond_hands < 40:
            return self._build_result("panic_seller", scores)

        if scores.overtrade > 65:
            return self._build_result("slot_machine", scores)

        if scores.diamond_hands > 75 and scores.fomo < 40:
            return self._build_result("diamond_hands", scores)

        if patterns.avg_hold_time_days < 2 and scores.overtrade > 50:
            return self._build_result("butterfly", scores)

        if patterns.trades_per_month < 5 and scores.overtrade < 25:
            return self._build_result("slow_steady", scores)

        if all(v < 35 for v in [scores.fomo, scores.panic, scores.revenge, scores.overtrade]):
            return self._build_result("cold_calculator", scores)

        # Default: Mixed profile
        return ArchetypeResult(
            key="mixed",
            name="Mixed Profile",
            emoji="🎭",
            description="You show a mix of emotional patterns. No single dominant trait — this can be both a strength and an area for deeper self-awareness.",
            coaching_focus="awareness",
            confidence=0.5,
        )

    def _build_result(self, key: str, scores: EmotionalScores) -> ArchetypeResult:
        archetype = ARCHETYPES[key]

        # Calculate confidence based on how dominant this trait is
        all_scores = [scores.fomo, scores.panic, scores.revenge, scores.overtrade, scores.diamond_hands]
        dominant_score = max(all_scores)
        avg_others = (sum(all_scores) - dominant_score) / max(len(all_scores) - 1, 1)
        confidence = min(1.0, 0.5 + (dominant_score - avg_others) / 100)

        return ArchetypeResult(
            key=key,
            name=archetype["name"],
            emoji=archetype["emoji"],
            description=archetype["description"],
            coaching_focus=archetype["coaching_focus"],
            confidence=round(confidence, 2),
        )
