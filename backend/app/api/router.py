from fastapi import APIRouter
from app.api.auth.routes import router as auth_router
from app.api.user.routes import router as user_router
from app.api.analysis.routes import router as analysis_router
from app.api.trades.routes import router as trades_router
from app.api.alerts.routes import router as alerts_router
from app.api.chat.routes import router as chat_router
from app.api.reports.routes import router as reports_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(user_router, prefix="/user", tags=["User"])
api_router.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(trades_router, prefix="/trades", tags=["Trades"])
api_router.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(chat_router, prefix="/chat", tags=["Chat"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
