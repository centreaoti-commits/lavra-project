from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from app.models.base import get_db
from app.models import User, Wallet, Trade, EmotionalScore, PersonalityProfile
from app.api.auth.routes import get_current_user

router = APIRouter()


@router.get("/{report_type}")
async def get_report(
    report_type: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a behavioral report."""
    if report_type not in ["daily", "weekly", "monthly"]:
        return {"error": "Invalid report type. Use: daily, weekly, monthly"}
    
    # Get user's wallet
    wallets_result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet = wallets_result.scalar_one_or_none()
    
    if not wallet:
        return {"error": "No wallet found. Please scan a wallet first."}
    
    # Determine time range
    now = datetime.utcnow()
    if report_type == "daily":
        start = now - timedelta(days=1)
    elif report_type == "weekly":
        start = now - timedelta(days=7)
    else:
        start = now - timedelta(days=30)
    
    # Get trades in period
    trades_result = await db.execute(
        select(Trade).where(
            Trade.wallet_id == wallet.id,
            Trade.trade_timestamp >= start,
        ).order_by(Trade.trade_timestamp.desc())
    )
    trades = trades_result.scalars().all()
    
    # Get latest scores
    scores_result = await db.execute(
        select(EmotionalScore).where(EmotionalScore.wallet_id == wallet.id)
        .order_by(EmotionalScore.created_at.desc()).limit(1)
    )
    scores = scores_result.scalar_one_or_none()
    
    # Get personality
    personality_result = await db.execute(
        select(PersonalityProfile).where(PersonalityProfile.wallet_id == wallet.id)
        .order_by(PersonalityProfile.created_at.desc()).limit(1)
    )
    personality = personality_result.scalar_one_or_none()
    
    # Calculate stats
    trade_count = len(trades)
    wins = sum(1 for t in trades if (t.pnl_usd or 0) > 0)
    losses = sum(1 for t in trades if (t.pnl_usd or 0) < 0)
    total_pnl = sum(t.pnl_usd or 0 for t in trades)
    emotional_loss = sum(abs(t.pnl_usd or 0) for t in trades if t.emotion_tag in ["fomo", "panic", "revenge"])
    
    # Generate insights
    insights = []
    if trade_count > 0:
        win_rate = wins / trade_count * 100
        insights.append(f"You made {trade_count} trades this {report_type} period")
        insights.append(f"Win rate: {win_rate:.0f}% ({wins} wins, {losses} losses)")
        insights.append(f"Net PnL: ${total_pnl:,.0f}")
        
        if emotional_loss > 0:
            insights.append(f"Estimated emotional loss: ${emotional_loss:,.0f}")
        
        # Emotion breakdown
        emotions = {}
        for t in trades:
            tag = t.emotion_tag or "unknown"
            emotions[tag] = emotions.get(tag, 0) + 1
        
        dominant_emotion = max(emotions, key=emotions.get) if emotions else "none"
        if dominant_emotion in ["fomo", "panic", "revenge"]:
            insights.append(f"Most common emotion: {dominant_emotion.upper()} ({emotions[dominant_emotion]} trades)")
    else:
        insights.append(f"No trades recorded this {report_type} period")
    
    return {
        "type": report_type,
        "period": f"{start.strftime('%Y-%m-%d')} to {now.strftime('%Y-%m-%d')}",
        "trade_count": trade_count,
        "pnl": round(total_pnl, 2),
        "emotional_loss": round(emotional_loss, 2),
        "scores": {
            "fomo": scores.fomo if scores else 0,
            "panic": scores.panic if scores else 0,
            "revenge": scores.revenge if scores else 0,
            "overtrade": scores.overtrade if scores else 0,
            "diamond_hands": scores.diamond_hands if scores else 0,
            "overall": scores.overall if scores else 0,
        },
        "personality": {
            "name": personality.archetype_name if personality else "Unknown",
            "emoji": personality.archetype_key if personality else "❓",
        },
        "insights": insights,
        "generated_at": now.isoformat(),
    }
