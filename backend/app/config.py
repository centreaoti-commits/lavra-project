from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Crypto Therapist"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/crypto_therapist"
    DATABASE_ECHO: bool = False

    # Auth
    JWT_SECRET: str = "ct-dev-secret-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_DAYS: int = 7
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days in minutes

    # Blockchain APIs
    ETHERSCAN_API_KEY: str = ""
    BSCSCAN_API_KEY: str = ""
    POLYGONSCAN_API_KEY: str = ""
    ARBISCAN_API_KEY: str = ""

    # RPC URLs (free public endpoints)
    ETH_RPC_URL: str = "https://eth.llamarpc.com"
    BSC_RPC_URL: str = "https://bsc-dataseed.binance.org"
    POLYGON_RPC_URL: str = "https://polygon-rpc.com"
    ARB_RPC_URL: str = "https://arb1.arbitrum.io/rpc"
    BASE_RPC_URL: str = "https://mainnet.base.org"
    OPTIMISM_RPC_URL: str = "https://mainnet.optimism.io"
    OP_RPC_URL: str = "https://mainnet.optimism.io"
    AVALANCHE_RPC_URL: str = "https://api.avax.network/ext/bc/C/rpc"
    AVAX_RPC_URL: str = "https://api.avax.network/ext/bc/C/rpc"

    # Price APIs
    COINGECKO_API_KEY: str = ""

    # AI
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    AI_MODEL: str = "mimo-v2.5-pro"
    AI_BASE_URL: str = "https://opengateway.gitlawb.com/v1"
    AI_PROVIDER: str = "gitlawb"  # 'openai' or 'gitlawb' 

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""

    # Email
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@crypto-therapist.io"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
