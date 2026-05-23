from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt
from datetime import datetime, timedelta
from eth_account.messages import encode_defunct
from eth_account import Account

from app.config import get_settings
from app.models.base import get_db
from app.models import User
from app.api.auth.dependencies import get_current_user

router = APIRouter()
settings = get_settings()


class NonceRequest(BaseModel):
    address: str


class NonceResponse(BaseModel):
    nonce: str
    message: str


class VerifyRequest(BaseModel):
    address: str
    signature: str
    message: str


class AuthResponse(BaseModel):
    token: str
    user_id: str
    address: str


# In-memory nonce store (use Redis in production)
nonces: dict[str, str] = {}


@router.post("/nonce", response_model=NonceResponse)
async def get_nonce(req: NonceRequest):
    """Generate a nonce for SIWE authentication."""
    import secrets
    address = req.address.lower()
    nonce = secrets.token_hex(16)
    nonces[address] = nonce
    
    message = f"Crypto Therapist wants you to sign in with your Ethereum account:\n{address}\n\nSign in to Crypto Therapist\n\nURI: https://crypto-therapist.io\nNonce: {nonce}"
    
    return NonceResponse(nonce=nonce, message=message)


@router.post("/verify", response_model=AuthResponse)
async def verify_signature(req: VerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify SIWE signature and issue JWT."""
    address = req.address.lower()
    
    # Verify the signature
    try:
        message_hash = encode_defunct(text=req.message)
        recovered = Account.recover_message(message_hash, signature=req.signature)
        
        if recovered.lower() != address:
            raise HTTPException(status_code=401, detail="Invalid signature")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Signature verification failed: {str(e)}")
    
    # Find or create user
    result = await db.execute(select(User).where(User.address == address))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(address=address, settings={
            "max_daily_trades": 5,
            "max_trade_size": 1000,
            "telegram_alerts": True,
            "email_alerts": False,
            "alert_cooldown_minutes": 30,
        })
        db.add(user)
        await db.flush()
    
    # Generate JWT
    token = jwt.encode(
        {
            "sub": user.id,
            "address": address,
            "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
        },
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    
    return AuthResponse(token=token, user_id=user.id, address=address)
