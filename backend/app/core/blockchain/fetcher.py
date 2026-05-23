import logging
logger = logging.getLogger(__name__)
"""
Blockchain Fetcher — Multi-chain transaction history fetcher.
Uses Etherscan V2 API (single endpoint, chainid-based routing).
Supports: Ethereum, BSC, Polygon, Arbitrum, Base, Optimism, Avalanche
"""

import httpx
import asyncio
from dataclasses import dataclass
from app.config import get_settings

settings = get_settings()

# Etherscan V2: single endpoint, chainid parameter
ETHERSCAN_V2_BASE = "https://api.etherscan.io/v2/api"

CHAIN_CONFIGS = {
    "ETH": {"chain_id": 1, "rpc": settings.ETH_RPC_URL, "native_token": "ETH"},
    "BSC": {"chain_id": 56, "rpc": settings.BSC_RPC_URL, "native_token": "BNB"},
    "POLYGON": {"chain_id": 137, "rpc": settings.POLYGON_RPC_URL, "native_token": "MATIC"},
    "ARBITRUM": {"chain_id": 42161, "rpc": settings.ARB_RPC_URL, "native_token": "ETH"},
    "BASE": {"chain_id": 8453, "rpc": settings.BASE_RPC_URL, "native_token": "ETH"},
    "OPTIMISM": {"chain_id": 10, "rpc": settings.OP_RPC_URL, "native_token": "ETH"},
    "AVALANCHE": {"chain_id": 43114, "rpc": settings.AVAX_RPC_URL, "native_token": "AVAX"},
}


@dataclass
class RawTransaction:
    hash: str
    from_address: str
    to_address: str
    value: str
    block_number: int
    timestamp: int
    gas_used: int
    gas_price: str
    is_error: bool
    chain: str
    method_id: str = ""
    function_name: str = ""


@dataclass
class RawERC20Transfer:
    hash: str
    from_address: str
    to_address: str
    value: str
    token_name: str
    token_symbol: str
    token_decimal: int
    contract_address: str
    block_number: int
    timestamp: int
    chain: str


class BlockchainFetcher:
    """Fetches transaction history from multiple blockchains via Etherscan V2 API."""

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=15)
        self._api_key = settings.ETHERSCAN_API_KEY or ""

    async def _etherscan_v2_request(self, chain_id: int, module: str, action: str, **extra_params) -> dict:
        """Make a request to Etherscan V2 API."""
        params = {
            "chainid": chain_id,
            "module": module,
            "action": action,
            "apikey": self._api_key or "YourApiKeyToken",
            **extra_params,
        }
        resp = await self.client.get(ETHERSCAN_V2_BASE, params=params)
        return resp.json()

    async def fetch_transactions(self, address: str, chain: str) -> list[RawTransaction]:
        """Fetch normal transactions from block explorer via Etherscan V2."""
        config = CHAIN_CONFIGS.get(chain.upper())
        if not config:
            raise ValueError(f"Unsupported chain: {chain}")

        if not self._api_key:
            logger.debug(f"No Etherscan API key configured — skipping {chain} tx fetch")
            return []

        try:
            data = await self._etherscan_v2_request(
                chain_id=config["chain_id"],
                module="account",
                action="txlist",
                address=address,
                startblock=0,
                endblock=99999999,
                page=1,
                offset=1000,
                sort="desc",
            )

            if data.get("status") != "1":
                logger.debug(f"No {chain} txs for {address}: {data.get('message', 'unknown')}")
                return []

            return [RawTransaction(
                hash=tx["hash"],
                from_address=tx["from"].lower(),
                to_address=tx.get("to", "").lower(),
                value=tx["value"],
                block_number=int(tx["blockNumber"]),
                timestamp=int(tx["timeStamp"]),
                gas_used=int(tx.get("gasUsed", 0)),
                gas_price=tx.get("gasPrice", "0"),
                is_error=tx.get("isError", "0") == "1",
                chain=chain.upper(),
                method_id=tx.get("methodId", ""),
                function_name=tx.get("functionName", ""),
            ) for tx in data.get("result", [])]

        except Exception as e:
            logger.info(f"Error fetching {chain} transactions: {e}")
            return []

    async def fetch_erc20_transfers(self, address: str, chain: str) -> list[RawERC20Transfer]:
        """Fetch ERC20 token transfers via Etherscan V2."""
        config = CHAIN_CONFIGS.get(chain.upper())
        if not config or not self._api_key:
            return []

        try:
            data = await self._etherscan_v2_request(
                chain_id=config["chain_id"],
                module="account",
                action="tokentx",
                address=address,
                startblock=0,
                endblock=99999999,
                page=1,
                offset=1000,
                sort="desc",
            )

            if data.get("status") != "1":
                return []

            return [RawERC20Transfer(
                hash=tx["hash"],
                from_address=tx["from"].lower(),
                to_address=tx["to"].lower(),
                value=tx["value"],
                token_name=tx.get("tokenName", ""),
                token_symbol=tx.get("tokenSymbol", ""),
                token_decimal=int(tx.get("tokenDecimal", 18)),
                contract_address=tx["contractAddress"].lower(),
                block_number=int(tx["blockNumber"]),
                timestamp=int(tx["timeStamp"]),
                chain=chain.upper(),
            ) for tx in data.get("result", [])]

        except Exception as e:
            logger.info(f"Error fetching {chain} ERC20 transfers: {e}")
            return []

    async def fetch_all(self, address: str, chains: list[str]) -> dict:
        """Fetch transactions from multiple chains."""
        results = {}
        for chain in chains:
            txs = await self.fetch_transactions(address, chain)
            erc20 = await self.fetch_erc20_transfers(address, chain)
            results[chain] = {"transactions": txs, "erc20_transfers": erc20}
        return results

    async def close(self):
        await self.client.aclose()
