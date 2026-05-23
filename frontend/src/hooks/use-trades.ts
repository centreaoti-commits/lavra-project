"use client";

import { useQuery } from "@tanstack/react-query"
import { api, type TradeQueryParams } from "@/lib/api";

export function useTrades(token: string | null, params: TradeQueryParams = {}) {
  return useQuery({
    queryKey: ["trades", params],
    queryFn: () => api.getTrades((token || ""), params),
    enabled: !!token,
  });
}

export function useTradeStats(token: string | null) {
  return useQuery({
    queryKey: ["tradeStats"],
    queryFn: () => api.getTradeStats((token || "")),
    enabled: !!token,
  });
}

export function usePublicTrades(walletAddress: string | null, params: TradeQueryParams = {}) {
  return useQuery({
    queryKey: ["publicTrades", walletAddress, params],
    queryFn: () => api.getPublicTrades(walletAddress || "", params),
    enabled: !!walletAddress,
  });
}
