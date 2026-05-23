from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.models.base import get_db
from app.models import User, ChatMessage, Wallet, EmotionalScore, PersonalityProfile, Analysis
from app.api.auth.routes import get_current_user
from app.core.ai.coach import AICoach

router = APIRouter()
coach = AICoach()


class ChatRequest(BaseModel):
    message: str


class PublicChatRequest(BaseModel):
    message: str
    analysis_data: Optional[dict] = None


@router.post("")
async def send_message(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message to the AI coach (authenticated)."""
    # Get user's analysis data for context
    wallets_result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet = wallets_result.scalars().first()
    
    analysis_data = {"scores": {}, "personality": {}, "stats": {}, "insights": []}
    
    if wallet:
        # Get latest scores
        scores_result = await db.execute(
            select(EmotionalScore).where(EmotionalScore.wallet_id == wallet.id)
            .order_by(EmotionalScore.created_at.desc()).limit(1)
        )
        scores = scores_result.scalar_one_or_none()
        
        if scores:
            analysis_data["scores"] = {
                "fomo": scores.fomo, "panic": scores.panic,
                "revenge": scores.revenge, "overtrade": scores.overtrade,
                "diamond_hands": scores.diamond_hands,
            }
        
        # Get personality
        personality_result = await db.execute(
            select(PersonalityProfile).where(PersonalityProfile.wallet_id == wallet.id)
            .order_by(PersonalityProfile.created_at.desc()).limit(1)
        )
        personality = personality_result.scalar_one_or_none()
        
        if personality:
            analysis_data["personality"] = {
                "name": personality.archetype_name,
                "emoji": "",
                "description": personality.description,
            }
        
        # Get analysis stats
        analysis_result = await db.execute(
            select(Analysis).where(Analysis.wallet_id == wallet.id)
            .order_by(Analysis.created_at.desc()).limit(1)
        )
        analysis = analysis_result.scalar_one_or_none()
        
        if analysis:
            analysis_data["stats"] = {
                "total_trades": analysis.total_trades,
                "win_rate": analysis.win_rate,
                "total_pnl": analysis.total_pnl,
                "emotional_loss": analysis.emotional_loss_estimate,
                "avg_hold_time": str(analysis.avg_hold_time_minutes) if analysis.avg_hold_time_minutes else "N/A",
            }
    
    # Get chat history
    history_result = await db.execute(
        select(ChatMessage).where(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.desc()).limit(20)
    )
    history = [{"role": msg.role, "content": msg.content} for msg in reversed(history_result.scalars().all())]
    
    # Get AI response
    response = await coach.get_response(req.message, analysis_data, history)
    
    # Save messages
    db.add(ChatMessage(user_id=user.id, role="user", content=req.message))
    db.add(ChatMessage(user_id=user.id, role="assistant", content=response))
    await db.commit()
    
    return {"response": response}


@router.post("/public")
async def public_chat(req: PublicChatRequest):
    """Send a message to the AI coach without authentication (uses provided analysis data)."""
    analysis_data = req.analysis_data or {
        "scores": {}, "personality": {}, "stats": {}, "insights": []
    }
    
    response = await coach.get_response(req.message, analysis_data, [])
    return {"response": response}


@router.get("/history")
async def get_history(
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get chat history."""
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.desc()).limit(limit)
    )
    messages = result.scalars().all()
    return [
        {
            "id": str(msg.id),
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
        }
        for msg in reversed(messages)
    ]
