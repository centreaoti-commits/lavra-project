"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmotionBadge } from "@/components/shared/emotion-badge";
import { PnLDisplay } from "@/components/shared/pnl-display";
import { useAuth } from "@/components/providers/auth-provider";
import { useTrades } from "@/hooks/use-trades";
import { usePublicTrades } from "@/hooks/use-trades";
import { useScanResults } from "@/hooks/use-scan-results";
import { formatTimeAgo, formatDuration } from "@/lib/format";
export function TradeTimeline() {
  const { token } = useAuth();
  const scanResults = useScanResults();
  const walletAddress = scanResults?.wallet_address || null;
  const { data: authData, isLoading: authLoading } = useTrades(token, { limit: 5 });
  const { data: publicData, isLoading: publicLoading } = usePublicTrades(!token ? walletAddress : null, { limit: 5 });
  const data = token ? authData : publicData;
  const isLoading = token ? authLoading : publicLoading;
  const trades = data?.data || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-sm">📊</span>
          Recent Trades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 shimmer rounded-xl" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] text-3xl">📭</div>
            <p className="mt-3 text-sm text-[#64748b]">No trades found</p>
          </div>
        ) : (
          <div className="relative space-y-1">
            {/* Timeline connector */}
            <div className="absolute left-[22px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-purple-500/20 via-cyan-500/10 to-transparent" />
            
            {trades.map((trade, i) => (
              <div
                key={trade.id}
                className="group relative flex items-center gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-white/[0.02]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border border-purple-500/10 font-bold text-purple-300 text-sm transition-all group-hover:scale-105 group-hover:border-purple-500/25">
                  {(trade.token_out || "?")[0]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{trade.token_out || "Unknown"}</span>
                    {trade.emotion_tag && <EmotionBadge emotion={trade.emotion_tag} score={trade.emotion_score || 0} size="sm" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[#475569]">
                    <span>{formatTimeAgo(trade.timestamp)}</span>
                    {trade.hold_duration_minutes && (
                      <>
                        <span className="text-[#2a2a3e]">•</span>
                        <span>Hold: {formatDuration(trade.hold_duration_minutes)}</span>
                      </>
                    )}
                    <span className="text-[#2a2a3e]">•</span>
                    <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium">{trade.chain}</span>
                  </div>
                </div>
                
                <PnLDisplay value={trade.pnl_usd || 0} percent={trade.pnl_percent || 0} size="sm" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
