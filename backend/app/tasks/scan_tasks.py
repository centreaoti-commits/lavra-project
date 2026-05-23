"""
Scan Tasks — Background wallet scanning and analysis.
"""

import asyncio
import logging
from datetime import datetime
from sqlalchemy import select

from app.tasks.celery_app import celery_app
from app.models.base import async_session
from app.models import Wallet, Trade, EmotionalScore, PersonalityProfile, Analysis
from app.core.blockchain.fetcher import BlockchainFetcher
from app.core.blockchain.dex_detector import DEXDetector
from app.core.analysis.scoring import ScoringEngine

logger = logging.getLogger(__name__)


def run_async(coro):
    """Run async coroutine in sync Celery task safely."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, coro).result()
    else:
        return asyncio.run(coro)


def _estimate_value_usd(token_in: str, amount_in: float) -> float:
    """Estimate USD value. Returns amount directly for stablecoins, 0 for unknown."""
    stablecoins = {"USDC", "USDT", "DAI", "BUSD", "FRAX", "TUSD"}
    if token_in in stablecoins:
        return amount_in
    if token_in == "NATIVE":
        return 0  # Unknown native price without API
    return 0  # Unknown token


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def scan_wallet_task(self, user_id: str, wallet_address: str, chains: list):
    """Background task to scan a wallet and perform analysis."""
    try:
        return run_async(_scan_wallet(user_id, wallet_address, chains))
    except Exception as exc:
        logger.error(f"Scan task failed for {wallet_address}: {exc}")
        self.retry(exc=exc)


async def _scan_wallet(user_id: str, wallet_address: str, chains: list):
    """Async wallet scanning logic."""
    async with async_session() as db:
        try:
            result = await db.execute(
                select(Wallet).where(Wallet.address == wallet_address.lower())
            )
            wallet = result.scalar_one_or_none()

            if not wallet:
                return {"error": "Wallet not found"}

            fetcher = BlockchainFetcher()
            dex_detector = DEXDetector()
            all_trades = []

            for chain in chains:
                try:
                    txs = await fetcher.fetch_transactions(wallet_address, chain)
                    erc20 = await fetcher.fetch_erc20_transfers(wallet_address, chain)

                    for tx in txs:
                        if tx.is_error:
                            continue
                        trade = dex_detector.identify_swap(tx, erc20)
                        if trade:
                            all_trades.append({
                                "hash": trade.tx_hash,
                                "chain": trade.chain,
                                "token_in": trade.token_in,
                                "token_out": trade.token_out,
                                "token_in_symbol": "NATIVE" if trade.token_in == "NATIVE" else trade.token_in[:8],
                                "token_out_symbol": "NATIVE" if trade.token_out == "NATIVE" else trade.token_out[:8],
                                "amount_in": trade.amount_in,
                                "amount_out": trade.amount_out,
                                "value_usd": _estimate_value_usd(trade.token_in, trade.amount_in),
                                "block_number": trade.block_number,
                                "trade_timestamp": datetime.fromtimestamp(trade.timestamp),
                                "is_buy": trade.is_buy,
                                "pnl_usd": 0,
                                "pnl_percent": 0,
                                "hold_duration_minutes": 0,
                                "price_change_24h": 0,
                                "distance_from_high": 50,
                                "volume_ratio": 1,
                                "minutes_since_move": 600,
                            })
                except Exception as e:
                    logger.warning(f"Error scanning {chain}: {e}")

            await fetcher.close()

            # Duplicate prevention
            existing_hashes_result = await db.execute(
                select(Trade.hash).where(Trade.wallet_id == wallet.id)
            )
            existing_hashes = {row[0] for row in existing_hashes_result.all()}

            new_count = 0
            for td in all_trades:
                if td["hash"] in existing_hashes:
                    continue
                new_count += 1
                trade = Trade(
                    wallet_id=wallet.id,
                    hash=td["hash"],
                    chain=td["chain"],
                    block_number=td["block_number"],
                    token_in=td["token_in"],
                    token_out=td["token_out"],
                    token_in_symbol=td["token_in_symbol"],
                    token_out_symbol=td["token_out_symbol"],
                    amount_in=td["amount_in"],
                    amount_out=td["amount_out"],
                    value_usd=td["value_usd"],
                    pnl_usd=td["pnl_usd"],
                    pnl_percent=td["pnl_percent"],
                    hold_duration_minutes=td["hold_duration_minutes"],
                    trade_timestamp=td["trade_timestamp"],
                    raw_data=td,
                )
                db.add(trade)

            # Run analysis on all trades
            all_db_trades_result = await db.execute(
                select(Trade).where(Trade.wallet_id == wallet.id)
            )
            all_db_trades = all_db_trades_result.scalars().all()

            trade_dicts = [{
                "hash": t.hash, "chain": t.chain,
                "token_in": t.token_in, "token_out": t.token_out,
                "token_in_symbol": t.token_in_symbol, "token_out_symbol": t.token_out_symbol,
                "amount_in": t.amount_in, "amount_out": t.amount_out,
                "value_usd": t.value_usd,
                "pnl_usd": t.pnl_usd or 0, "pnl_percent": t.pnl_percent or 0,
                "hold_duration_minutes": t.hold_duration_minutes or 0,
                "trade_timestamp": t.trade_timestamp,
                "is_buy": True, "price_change_24h": 0,
                "distance_from_high": 50, "volume_ratio": 1, "minutes_since_move": 600,
            } for t in all_db_trades]

            engine = ScoringEngine()
            result = engine.analyze_trades(trade_dicts)

            # Update or create analysis
            existing_analysis = await db.execute(
                select(Analysis).where(Analysis.wallet_id == wallet.id).order_by(Analysis.created_at.desc()).limit(1)
            )
            existing = existing_analysis.scalar_one_or_none()

            if existing:
                existing.total_trades = result.trade_count
                existing.total_pnl = result.total_pnl
                existing.win_rate = result.win_rate
                existing.avg_hold_time_minutes = result.avg_hold_time
                existing.biggest_win = result.biggest_win
                existing.biggest_loss = result.biggest_loss
                existing.emotional_loss_estimate = result.emotional_loss
                existing.key_insights = result.insights
            else:
                analysis = Analysis(
                    wallet_id=wallet.id,
                    total_trades=result.trade_count,
                    total_pnl=result.total_pnl,
                    win_rate=result.win_rate,
                    avg_hold_time_minutes=result.avg_hold_time,
                    biggest_win=result.biggest_win,
                    biggest_loss=result.biggest_loss,
                    emotional_loss_estimate=result.emotional_loss,
                    key_insights=result.insights,
                )
                db.add(analysis)

            score = EmotionalScore(
                wallet_id=wallet.id,
                fomo=result.scores.fomo, panic=result.scores.panic,
                revenge=result.scores.revenge, overtrade=result.scores.overtrade,
                diamond_hands=result.scores.diamond_hands, overall=result.scores.overall,
                period="all_time", period_start=datetime.utcnow(),
            )
            db.add(score)

            personality = PersonalityProfile(
                wallet_id=wallet.id,
                archetype_key=result.personality.key,
                archetype_name=result.personality.name,
                description=result.personality.description,
                coaching_focus=result.personality.coaching_focus,
                confidence=result.personality.confidence,
                insights=result.insights,
            )
            db.add(personality)

            wallet.last_scanned_at = datetime.utcnow()
            await db.commit()

            return {
                "status": "complete",
                "wallet_id": str(wallet.id),
                "trades_found": len(all_trades),
                "new_trades": new_count,
                "scores": {
                    "fomo": result.scores.fomo, "panic": result.scores.panic,
                    "revenge": result.scores.revenge, "overtrade": result.scores.overtrade,
                    "diamond_hands": result.scores.diamond_hands, "overall": result.scores.overall,
                },
                "personality": {
                    "key": result.personality.key, "name": result.personality.name,
                    "emoji": result.personality.emoji, "description": result.personality.description,
                },
                "stats": {
                    "total_trades": result.trade_count, "win_rate": result.win_rate,
                    "total_pnl": result.total_pnl, "emotional_loss": result.emotional_loss,
                },
                "insights": result.insights,
            }

        except Exception as e:
            await db.rollback()
            logger.error(f"Scan failed for {wallet_address}: {e}")
            return {"error": str(e)}


@celery_app.task
def rescan_active_wallets():
    """Rescan all active wallets that haven't been scanned in 6+ hours."""
    async def _rescan():
        from datetime import timedelta
        async with async_session() as db:
            cutoff = datetime.utcnow() - timedelta(hours=6)
            result = await db.execute(
                select(Wallet).where(
                    (Wallet.last_scanned_at == None) | (Wallet.last_scanned_at < cutoff)
                ).limit(50)
            )
            wallets = result.scalars().all()
            for wallet in wallets:
                scan_wallet_task.delay(
                    user_id=str(wallet.user_id),
                    wallet_address=wallet.address,
                    chains=wallet.chains or ["ETH"],
                )

    run_async(_rescan())
    return {"status": "triggered", "message": "Rescan initiated for active wallets"}
