"""
DEX Trade Detector — Identifies DEX trades from raw transactions.

Recognizes:
- Uniswap V2/V3
- SushiSwap
- PancakeSwap
- 1inch
- 0x Protocol
- Generic swap patterns
"""

from dataclasses import dataclass
from typing import Optional


# Known DEX router addresses
DEX_ROUTERS = {
    # Uniswap
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": ("Uniswap V2", "ETH"),
    "0xe592427a0aece92de3edee1f18e0157c05861564": ("Uniswap V3", "ETH"),
    "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": ("Uniswap V3", "ETH"),
    # SushiSwap
    "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": ("SushiSwap", "ETH"),
    # PancakeSwap
    "0x10ed43c718714eb63d5aa57b78b54704e256024e": ("PancakeSwap", "BSC"),
    "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4": ("PancakeSwap V3", "BSC"),
    # 1inch
    "0x1111111254fb6c44bac0bed2854e76f90643097d": ("1inch", "ETH"),
    "0x1111111254eeb25477b68fb85ed929f73a960582": ("1inch V4", "ETH"),
    # 0x Protocol
    "0xdef1c0ded9bec7f1a1670819833240f027b25eff": ("0x", "ETH"),
    # Curve
    "0x99a58482BD75cbab83b27EC03CA68fF489b5788f": ("Curve", "ETH"),
}


@dataclass
class DEXTrade:
    dex_name: str
    chain: str
    tx_hash: str
    block_number: int
    timestamp: int
    from_address: str
    token_in: str
    token_out: str
    amount_in: float
    amount_out: float
    is_buy: bool  # True if buying token_out with native/stable


class DEXDetector:
    """Detects DEX trades from transaction data."""

    def is_dex_trade(self, to_address: str) -> Optional[tuple[str, str]]:
        """Check if the transaction is to a known DEX router."""
        return DEX_ROUTERS.get(to_address.lower())

    def identify_swap(self, tx, erc20_transfers: list) -> Optional[DEXTrade]:
        """Try to identify a swap from a transaction + its ERC20 transfers."""
        dex_info = self.is_dex_trade(tx.to_address)
        if not dex_info:
            # Check if it's a swap by method ID
            if tx.method_id not in ["0x38ed1739", "0x8803dbee", "0x7ff36ab5",
                                      "0x18cbafe5", "0xfb3bdb41", "0x5c11d795"]:
                return None
            dex_name = "Unknown DEX"
            chain = tx.chain
        else:
            dex_name, chain = dex_info

        # Find related ERC20 transfers in same transaction
        related = [t for t in erc20_transfers if t.hash == tx.hash]

        if len(related) < 1:
            return None

        # Determine token in (transfer FROM user) and token out (transfer TO user)
        token_in_transfer = None
        token_out_transfer = None

        for transfer in related:
            if transfer.from_address == tx.from_address:
                token_in_transfer = transfer
            elif transfer.to_address == tx.from_address:
                token_out_transfer = transfer

        if not token_in_transfer and not token_out_transfer:
            return None

        # If only one side, could be buy with native token or sell to native
        if token_in_transfer and not token_out_transfer:
            # Selling token for native
            return DEXTrade(
                dex_name=dex_name,
                chain=chain,
                tx_hash=tx.hash,
                block_number=tx.block_number,
                timestamp=tx.timestamp,
                from_address=tx.from_address,
                token_in=token_in_transfer.contract_address,
                token_out="NATIVE",
                amount_in=self._to_float(token_in_transfer.value, token_in_transfer.token_decimal),
                amount_out=self._to_float(tx.value, 18),
                is_buy=False,
            )

        if token_out_transfer and not token_in_transfer:
            # Buying token with native
            return DEXTrade(
                dex_name=dex_name,
                chain=chain,
                tx_hash=tx.hash,
                block_number=tx.block_number,
                timestamp=tx.timestamp,
                from_address=tx.from_address,
                token_in="NATIVE",
                token_out=token_out_transfer.contract_address,
                amount_in=self._to_float(tx.value, 18),
                amount_out=self._to_float(token_out_transfer.value, token_out_transfer.token_decimal),
                is_buy=True,
            )

        # Both sides present — token-to-token swap
        return DEXTrade(
            dex_name=dex_name,
            chain=chain,
            tx_hash=tx.hash,
            block_number=tx.block_number,
            timestamp=tx.timestamp,
            from_address=tx.from_address,
            token_in=token_in_transfer.contract_address,
            token_out=token_out_transfer.contract_address,
            amount_in=self._to_float(token_in_transfer.value, token_in_transfer.token_decimal),
            amount_out=self._to_float(token_out_transfer.value, token_out_transfer.token_decimal),
            is_buy=True,  # Assume buying the output token
        )

    def _to_float(self, value: str, decimals: int) -> float:
        try:
            return int(value) / (10 ** decimals)
        except (ValueError, ZeroDivisionError):
            return 0.0
