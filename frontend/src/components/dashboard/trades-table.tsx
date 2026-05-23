"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmotionBadge } from "@/components/shared/emotion-badge";
import { ChainIcon } from "@/components/shared/chain-icon";
import { PnLDisplay } from "@/components/shared/pnl-display";
import { useAuth } from "@/components/providers/auth-provider";
import { useTrades } from "@/hooks/use-trades";
import { usePublicTrades } from "@/hooks/use-trades";
import { useScanResults } from "@/hooks/use-scan-results";
import { formatUSD, formatDuration } from "@/lib/format";
export function TradesTable() {
  const { token } = useAuth();
  const scanResults = useScanResults();
  const walletAddress = scanResults?.wallet_address || null;
  const { data: authData, isLoading: authLoading } = useTrades(token, { limit: 10 });
  const { data: publicData, isLoading: publicLoading } = usePublicTrades(!token ? walletAddress : null, { limit: 10 });
  const data = token ? authData : publicData;
  const isLoading = token ? authLoading : publicLoading;
  const trades = data?.data || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-sm">📋</span>
            All Trades
          </CardTitle>
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium text-[#64748b]">
            {data?.total || 0} total
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 px-6 pb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 shimmer rounded-xl" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] text-3xl">
              📭
            </div>
            <p className="mt-3 text-sm font-medium text-[#64748b]">No trades to display</p>
            <p className="mt-1 text-xs text-[#475569]">Scan a wallet to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-6 pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Trade</th>
                  <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Chain</th>
                  <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Value</th>
                  <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#475569]">PnL</th>
                  <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Emotion</th>
                  <th className="px-6 pb-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Hold</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, i) => (
                  <tr
                    key={trade.id}
                    className="table-row-hover border-b border-white/[0.02] transition-all cursor-pointer"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border border-purple-500/10 text-xs font-bold text-purple-300 transition-all group-hover:scale-105">
                          {(trade.token_out || "?")[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{trade.token_out || "Unknown"}</p>
                          <p className="font-mono text-[10px] text-[#475569]">{trade.hash?.slice(0, 10)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5"><ChainIcon chain={trade.chain || "ETH"} size="sm" /></td>
                    <td className="py-3.5 text-right font-mono text-sm font-medium text-white">{formatUSD(trade.value_usd || 0)}</td>
                    <td className="py-3.5 text-right"><PnLDisplay value={trade.pnl_usd || 0} percent={trade.pnl_percent || 0} size="sm" /></td>
                    <td className="py-3.5">
                      {trade.emotion_tag ? (
                        <EmotionBadge emotion={trade.emotion_tag} score={trade.emotion_score || 0} size="sm" />
                      ) : (
                        <span className="text-xs text-[#475569]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-xs text-[#64748b]">
                      {trade.hold_duration_minutes ? formatDuration(trade.hold_duration_minutes) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
