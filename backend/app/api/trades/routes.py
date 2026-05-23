from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.models.base import get_db
from app.models import User, Wallet, Trade
from app.api.auth.routes import get_current_user

router = APIRouter()


@router.get("")
async def get_trades(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    emotion: Optional[str] = None,
    token: Optional[str] = None,
    chain: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's trades with filters."""
    # Get user's wallets
    wallets_result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet_ids = [w.id for w in wallets_result.scalars().all()]
    
    if not wallet_ids:
        return {"data": [], "total": 0, "page": page, "limit": limit, "total_pages": 0}
    
    # Build query
    query = select(Trade).where(Trade.wallet_id.in_(wallet_ids))
    
    if emotion:
        query = query.where(Trade.emotion_tag == emotion)
    if token:
        query = query.where(Trade.token_out_symbol.ilike(f"%{token}%"))
    if chain:
        query = query.where(Trade.chain == chain.upper())
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Paginate
    offset = (page - 1) * limit
    query = query.order_by(Trade.trade_timestamp.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    trades = result.scalars().all()
    
    return {
        "data": [
            {
                "id": t.id,
                "hash": t.hash,
                "chain": t.chain,
                "token_in": t.token_in_symbol,
                "token_out": t.token_out_symbol,
                "amount_in": t.amount_in,
                "amount_out": t.amount_out,
                "value_usd": t.value_usd,
                "pnl_usd": t.pnl_usd,
                "pnl_percent": t.pnl_percent,
                "emotion_tag": t.emotion_tag,
                "emotion_score": t.emotion_score,
                "hold_duration_minutes": t.hold_duration_minutes,
                "timestamp": t.trade_timestamp.isoformat(),
            }
            for t in trades
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/stats")
async def get_trade_stats(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get aggregated trade statistics."""
    wallets_result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallet_ids = [w.id for w in wallets_result.scalars().all()]
    
    if not wallet_ids:
        return {
            "total_trades": 0, "total_pnl": 0, "win_rate": 0,
            "avg_hold_time": 0, "biggest_win": 0, "biggest_loss": 0,
        }
    
    # Get trades
    result = await db.execute(select(Trade).where(Trade.wallet_id.in_(wallet_ids)))
    trades = result.scalars().all()
    
    total = len(trades)
    wins = sum(1 for t in trades if (t.pnl_usd or 0) > 0)
    total_pnl = sum(t.pnl_usd or 0 for t in trades)
    hold_times = [t.hold_duration_minutes or 0 for t in trades]
    
    return {
        "total_trades": total,
        "total_pnl": round(total_pnl, 2),
        "win_rate": round(wins / max(1, total) * 100, 1),
        "avg_hold_time": int(sum(hold_times) / max(1, len(hold_times))),
        "biggest_win": round(max((t.pnl_usd or 0) for t in trades), 2) if trades else 0,
        "biggest_loss": round(min((t.pnl_usd or 0) for t in trades), 2) if trades else 0,
    }


@router.get("/public")
async def get_public_trades(
    wallet_address: str = Query(...),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get trades by wallet address — no auth required."""
    address = wallet_address.lower()
    wallet_result = await db.execute(select(Wallet).where(Wallet.address == address))
    wallet = wallet_result.scalar_one_or_none()

    if not wallet:
        return {"data": [], "total": 0, "page": page, "limit": limit, "total_pages": 0}

    query = select(Trade).where(Trade.wallet_id == wallet.id)
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    offset = (page - 1) * limit
    query = query.order_by(Trade.trade_timestamp.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    trades = result.scalars().all()

    return {
        "data": [
            {
                "id": t.id, "hash": t.hash, "chain": t.chain,
                "token_in": t.token_in_symbol, "token_out": t.token_out_symbol,
                "amount_in": t.amount_in, "amount_out": t.amount_out,
                "value_usd": t.value_usd, "pnl_usd": t.pnl_usd,
                "pnl_percent": t.pnl_percent, "emotion_tag": t.emotion_tag,
                "emotion_score": t.emotion_score,
                "hold_duration_minutes": t.hold_duration_minutes,
                "timestamp": t.trade_timestamp.isoformat(),
            }
            for t in trades
        ],
        "total": total, "page": page, "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }
