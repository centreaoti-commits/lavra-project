"""
Aggregate Scoring System — Combines all emotional detectors into unified scores.
"""

from dataclasses import dataclass
from app.core.analysis.fomo_detector import FOMODetector, TradeContext
from app.core.analysis.panic_detector import PanicDetector, PanicContext
from app.core.analysis.revenge_detector import RevengeDetector, RecentLoss
from app.core.analysis.overtrade_detector import OvertradeDetector, OvertradeContext
from app.core.analysis.diamond_hands import DiamondHandsScorer, DiamondHandsContext
from app.core.analysis.personality import PersonalityEngine, EmotionalScores, TradePatterns, ArchetypeResult
from app.models import Trade

from datetime import datetime


@dataclass
class AnalysisResult:
    scores: EmotionalScores
    personality: ArchetypeResult
    trade_count: int
    win_count: int
    loss_count: int
    total_pnl: float
    emotional_loss: float
    win_rate: float
    avg_hold_time: int
    biggest_win: float
    biggest_loss: float
    insights: list[str]


class ScoringEngine:
    """Orchestrates all detectors to produce aggregate analysis."""

    def __init__(self):
        self.fomo = FOMODetector()
        self.panic = PanicDetector()
        self.revenge = RevengeDetector()
        self.overtrade = OvertradeDetector()
        self.diamond = DiamondHandsScorer()
        self.personality = PersonalityEngine()

    def analyze_trades(self, trades: list[dict], user_avg_trade_size: float = 1000) -> AnalysisResult:
        """Analyze a list of trades and produce full behavioral analysis."""

        if not trades:
            return self._empty_result()

        fomo_scores = []
        panic_scores = []
        revenge_scores = []
        diamond_scores = []
        emotional_loss = 0
        win_count = 0
        loss_count = 0
        total_pnl = 0
        hold_times = []
        biggest_win = 0
        biggest_loss = 0
        insights = []

        recent_losses = []

        for trade in trades:
            pnl = trade.get("pnl_usd", 0) or 0
            pnl_pct = trade.get("pnl_percent", 0) or 0
            value = trade.get("value_usd", 0) or 0
            hold = trade.get("hold_duration_minutes", 0) or 0
            token = trade.get("token_out_symbol", "UNKNOWN")
            ts = trade.get("trade_timestamp", datetime.utcnow())

            total_pnl += pnl
            hold_times.append(hold)

            if pnl > 0:
                win_count += 1
                biggest_win = max(biggest_win, pnl)
            else:
                loss_count += 1
                biggest_loss = min(biggest_loss, pnl)
                recent_losses.append(RecentLoss(
                    timestamp=ts if isinstance(ts, datetime) else datetime.utcnow(),
                    pnl_usd=pnl,
                    token=token,
                ))

            # FOMO detection (for buys)
            if trade.get("is_buy", True):
                ctx = TradeContext(
                    price_change_24h=trade.get("price_change_24h", 0),
                    distance_from_local_high=trade.get("distance_from_high", 50),
                    volume_ratio=trade.get("volume_ratio", 1),
                    user_avg_trade_size=user_avg_trade_size,
                    minutes_since_price_move=trade.get("minutes_since_move", 600),
                )
                fomo_result = self.fomo.calculate_fomo_score(value, ctx)
                fomo_scores.append(fomo_result.score)

                if fomo_result.score > 60:
                    emotional_loss += abs(pnl) if pnl < 0 else 0

            # Panic detection (for sells at loss)
            if pnl < 0:
                panic_ctx = PanicContext(
                    price_drop_since_entry=abs(pnl_pct),
                    hold_duration_minutes=hold,
                    is_market_dropping=trade.get("market_down", False),
                    volume_spike=trade.get("volume_ratio", 1),
                    token_trend_7d=trade.get("trend_7d", 0),
                    user_avg_hold_time=int(sum(hold_times) / len(hold_times)) if hold_times else 0,
                )
                panic_result = self.panic.detect_panic_sell(pnl_pct, panic_ctx)
                panic_scores.append(panic_result.score)

                if panic_result.score > 60:
                    emotional_loss += abs(pnl)

            # Revenge detection
            if recent_losses:
                rev_result = self.revenge.detect_revenge_trade(
                    current_value_usd=value,
                    current_token=token,
                    current_time=ts if isinstance(ts, datetime) else datetime.utcnow(),
                    recent_losses=recent_losses[-5:],
                    revenge_count_30d=trade.get("revenge_count", 0),
                )
                revenge_scores.append(rev_result.score)

                if rev_result.score > 60:
                    emotional_loss += abs(pnl) if pnl < 0 else 0

            # Diamond hands
            if hold > 0:
                diamond_ctx = DiamondHandsContext(
                    hold_duration_minutes=hold,
                    pnl_percent=pnl_pct,
                    max_drawdown_during_hold=trade.get("max_drawdown", abs(pnl_pct) if pnl < 0 else 5),
                    recovery_after_drawdown=trade.get("recovery", pnl_pct if pnl > 0 else 0),
                    user_avg_hold_time=int(sum(hold_times) / len(hold_times)) if hold_times else 0,
                    is_profitable=pnl > 0,
                )
                diamond_result = self.diamond.score_diamond_hands(diamond_ctx)
                diamond_scores.append(diamond_result.score)

        # Overtrade detection
        if trades:
            first_trade_time = trades[0].get("trade_timestamp", datetime.utcnow())
            if isinstance(first_trade_time, datetime):
                days_active = max(1, (datetime.utcnow() - first_trade_time).days)
            else:
                days_active = 1

            overtrade_ctx = OvertradeContext(
                trades_today=sum(1 for t in trades if self._is_today(t.get("trade_timestamp"))),
                trades_this_week=len(trades),
                user_avg_trades_per_day=len(trades) / days_active,
                unique_tokens_today=len(set(t.get("token_out_symbol", "") for t in trades if self._is_today(t.get("trade_timestamp")))),
                hour_of_day=datetime.utcnow().hour,
                win_rate_at_high_frequency=0,
                win_rate_at_low_frequency=0,
            )
            overtrade_result = self.overtrade.check_overtrade(overtrade_ctx)
            overtrade_score = overtrade_result.score
        else:
            overtrade_score = 0

        # Calculate averages
        avg_fomo = sum(fomo_scores) / len(fomo_scores) if fomo_scores else 0
        avg_panic = sum(panic_scores) / len(panic_scores) if panic_scores else 0
        avg_revenge = sum(revenge_scores) / len(revenge_scores) if revenge_scores else 0
        avg_diamond = sum(diamond_scores) / len(diamond_scores) if diamond_scores else 0

        # Overall score (lower is better — it's a "problem" score)
        overall = (avg_fomo * 0.3 + avg_panic * 0.25 + avg_revenge * 0.25 + overtrade_score * 0.2)

        scores = EmotionalScores(
            fomo=round(avg_fomo, 1),
            panic=round(avg_panic, 1),
            revenge=round(avg_revenge, 1),
            overtrade=round(overtrade_score, 1),
            diamond_hands=round(avg_diamond, 1),
            overall=round(overall, 1),
        )

        # Personality
        total_trades = len(trades)
        patterns = TradePatterns(
            avg_hold_time_days=(sum(hold_times) / len(hold_times) / 1440) if hold_times else 0,
            trades_per_month=total_trades / max(1, (total_trades * 30 / len(trades))),
            win_rate=(win_count / total_trades * 100) if total_trades > 0 else 0,
            avg_trade_size=user_avg_trade_size,
            unique_tokens_ratio=len(set(t.get("token_out_symbol", "") for t in trades)) / max(1, total_trades),
        )

        personality = self.personality.assign_archetype(scores, patterns)

        # Generate insights
        if avg_fomo > 60:
            insights.append(f"🔴 Your FOMO score is {avg_fomo:.0f}/100 — you frequently buy after pumps")
        if avg_panic > 60:
            insights.append(f"🔴 Your Panic score is {avg_panic:.0f}/100 — you sell during dips too often")
        if avg_revenge > 60:
            insights.append(f"🔴 Your Revenge score is {avg_revenge:.0f}/100 — you trade aggressively after losses")
        if overtrade_score > 60:
            insights.append(f"🟡 Your Overtrade score is {overtrade_score:.0f}/100 — you trade too frequently")
        if emotional_loss > 0:
            insights.append(f"💸 Estimated emotional loss: ${emotional_loss:,.0f}")
        if patterns.win_rate > 50:
            insights.append(f"🟢 Your win rate of {patterns.win_rate:.0f}% is above average!")

        return AnalysisResult(
            scores=scores,
            personality=personality,
            trade_count=total_trades,
            win_count=win_count,
            loss_count=loss_count,
            total_pnl=round(total_pnl, 2),
            emotional_loss=round(emotional_loss, 2),
            win_rate=round(win_count / max(1, total_trades) * 100, 1),
            avg_hold_time=int(sum(hold_times) / len(hold_times)) if hold_times else 0,
            biggest_win=round(biggest_win, 2),
            biggest_loss=round(biggest_loss, 2),
            insights=insights,
        )

    def _is_today(self, ts) -> bool:
        if not ts or not isinstance(ts, datetime):
            return False
        return ts.date() == datetime.utcnow().date()

    def _empty_result(self) -> AnalysisResult:
        return AnalysisResult(
            scores=EmotionalScores(0, 0, 0, 0, 0, 0),
            personality=ArchetypeResult("unknown", "No Data", "❓", "Not enough trades to analyze", "none", 0),
            trade_count=0, win_count=0, loss_count=0, total_pnl=0,
            emotional_loss=0, win_rate=0, avg_hold_time=0,
            biggest_win=0, biggest_loss=0,
            insights=["Not enough trades to perform analysis. Connect a wallet with trading history."],
        )
