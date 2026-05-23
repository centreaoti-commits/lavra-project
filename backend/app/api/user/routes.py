from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.models.base import get_db
from app.models import User, Wallet
from app.api.auth.routes import get_current_user

router = APIRouter()


class UpdateSettingsRequest(BaseModel):
    max_daily_trades: Optional[int] = None
    max_trade_size: Optional[int] = None
    telegram_alerts: Optional[bool] = None
    email_alerts: Optional[bool] = None
    telegram_chat_id: Optional[str] = None
    email: Optional[str] = None


class AddWalletRequest(BaseModel):
    address: str
    label: Optional[str] = None


@router.get("/profile")
async def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "address": user.address,
        "email": user.email,
        "subscription": user.subscription,
        "settings": user.settings,
        "created_at": user.created_at.isoformat(),
    }


@router.patch("/settings")
async def update_settings(
    req: UpdateSettingsRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = user.settings or {}
    
    for field, value in req.model_dump(exclude_none=True).items():
        if field in ["email", "telegram_chat_id"]:
            setattr(user, field, value)
        else:
            settings[field] = value
    
    user.settings = settings
    await db.flush()
    
    return {"status": "ok", "settings": user.settings}


@router.get("/wallets")
async def get_wallets(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallets = result.scalars().all()
    
    return [
        {
            "id": w.id,
            "address": w.address,
            "label": w.label,
            "chains": w.chains,
            "last_scanned": w.last_scanned_at.isoformat() if w.last_scanned_at else None,
        }
        for w in wallets
    ]


@router.post("/wallets")
async def add_wallet(
    req: AddWalletRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate address
    if not req.address.startswith("0x") or len(req.address) != 42:
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    
    # Check if wallet already exists
    result = await db.execute(
        select(Wallet).where(Wallet.address == req.address.lower(), Wallet.user_id == user.id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Wallet already added")
    
    wallet = Wallet(
        user_id=user.id,
        address=req.address.lower(),
        label=req.label or "Wallet",
        chains=["ETH", "BSC", "POLYGON", "ARBITRUM", "BASE", "OPTIMISM", "AVALANCHE"],
    )
    db.add(wallet)
    await db.flush()
    
    return {
        "id": wallet.id,
        "address": wallet.address,
        "label": wallet.label,
        "chains": wallet.chains,
    }


@router.delete("/wallets/{wallet_id}")
async def remove_wallet(
    wallet_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wallet).where(Wallet.id == wallet_id, Wallet.user_id == user.id)
    )
    wallet = result.scalar_one_or_none()
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    await db.delete(wallet)
    return {"status": "deleted"}
