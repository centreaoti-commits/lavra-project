import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Float, Integer, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    address: Mapped[str] = mapped_column(String(42), unique=True, index=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    telegram_chat_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    subscription: Mapped[str] = mapped_column(String(20), default="free")  # free, pro, premium
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    wallets: Mapped[list["Wallet"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    chat_messages: Mapped[list["ChatMessage"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Wallet(Base, TimestampMixin):
    __tablename__ = "wallets"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    address: Mapped[str] = mapped_column(String(42), nullable=False, index=True)
    label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    chains: Mapped[list | None] = mapped_column(JSON, nullable=True)  # ["ETH", "BSC", ...]
    last_scanned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="wallets")
    trades: Mapped[list["Trade"]] = relationship(back_populates="wallet", cascade="all, delete-orphan")
    analyses: Mapped[list["Analysis"]] = relationship(back_populates="wallet", cascade="all, delete-orphan")


class Trade(Base, TimestampMixin):
    __tablename__ = "trades"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id: Mapped[str] = mapped_column(ForeignKey("wallets.id"), nullable=False, index=True)
    hash: Mapped[str] = mapped_column(String(66), nullable=False, index=True)
    chain: Mapped[str] = mapped_column(String(20), nullable=False)
    block_number: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Trade details
    token_in: Mapped[str] = mapped_column(String(42), nullable=False)
    token_out: Mapped[str] = mapped_column(String(42), nullable=False)
    token_in_symbol: Mapped[str | None] = mapped_column(String(20), nullable=True)
    token_out_symbol: Mapped[str | None] = mapped_column(String(20), nullable=True)
    amount_in: Mapped[float] = mapped_column(Float, nullable=False)
    amount_out: Mapped[float] = mapped_column(Float, nullable=False)
    value_usd: Mapped[float] = mapped_column(Float, nullable=False)
    
    # PnL
    pnl_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    pnl_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Emotional analysis
    emotion_tag: Mapped[str | None] = mapped_column(String(20), nullable=True)  # fomo, panic, revenge, overtrade, diamond, planned
    emotion_score: Mapped[float | None] = mapped_column(Float, nullable=True)  # 0-100
    
    # Timing
    hold_duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    trade_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Raw data
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    wallet: Mapped["Wallet"] = relationship(back_populates="trades")


class EmotionalScore(Base, TimestampMixin):
    __tablename__ = "emotional_scores"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id: Mapped[str] = mapped_column(ForeignKey("wallets.id"), nullable=False, index=True)
    
    fomo: Mapped[float] = mapped_column(Float, default=0)
    panic: Mapped[float] = mapped_column(Float, default=0)
    revenge: Mapped[float] = mapped_column(Float, default=0)
    overtrade: Mapped[float] = mapped_column(Float, default=0)
    diamond_hands: Mapped[float] = mapped_column(Float, default=0)
    overall: Mapped[float] = mapped_column(Float, default=0)
    
    period: Mapped[str] = mapped_column(String(20), nullable=False)  # "daily", "weekly", "all_time"
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class PersonalityProfile(Base, TimestampMixin):
    __tablename__ = "personality_profiles"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id: Mapped[str] = mapped_column(ForeignKey("wallets.id"), nullable=False, index=True)
    
    archetype_key: Mapped[str] = mapped_column(String(50), nullable=False)
    archetype_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    coaching_focus: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    
    insights: Mapped[list | None] = mapped_column(JSON, nullable=True)


class Analysis(Base, TimestampMixin):
    __tablename__ = "analyses"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id: Mapped[str] = mapped_column(ForeignKey("wallets.id"), nullable=False, index=True)
    
    total_trades: Mapped[int] = mapped_column(Integer, default=0)
    total_pnl: Mapped[float] = mapped_column(Float, default=0)
    win_rate: Mapped[float] = mapped_column(Float, default=0)
    avg_hold_time_minutes: Mapped[int] = mapped_column(Integer, default=0)
    biggest_win: Mapped[float] = mapped_column(Float, default=0)
    biggest_loss: Mapped[float] = mapped_column(Float, default=0)
    emotional_loss_estimate: Mapped[float] = mapped_column(Float, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    
    key_insights: Mapped[list | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    wallet: Mapped["Wallet"] = relationship(back_populates="analyses")


class Alert(Base, TimestampMixin):
    __tablename__ = "alerts"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # fomo, panic, revenge, overtrade, positive, info
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # critical, warning, positive, info
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    trade_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="alerts")


class ChatMessage(Base, TimestampMixin):
    __tablename__ = "chat_messages"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user, assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="chat_messages")


class Achievement(Base, TimestampMixin):
    __tablename__ = "achievements"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    
    badge_key: Mapped[str] = mapped_column(String(50), nullable=False)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
