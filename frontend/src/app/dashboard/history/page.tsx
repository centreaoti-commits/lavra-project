"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmotionBadge } from "@/components/shared/emotion-badge";
import { ChainIcon } from "@/components/shared/chain-icon";
import { PnLDisplay } from "@/components/shared/pnl-display";
import { useAuth } from "@/components/providers/auth-provider";
import { useTrades, useTradeStats } from "@/hooks/use-trades";
import { formatUSD, formatDuration } from "@/lib/format";

const emotionFilters = [
  { key: "", label: "All", icon: "🔍" },
  { key: "fomo", label: "FOMO", icon: "🏃" },
  { key: "panic", label: "Panic", icon: "😱" },
  { key: "revenge", label: "Revenge", icon: "😤" },
  { key: "planned", label: "Planned", icon: "🧠" },
  { key: "diamond", label: "Diamond", icon: "💎" },
];

export default function HistoryPage() {
  const { token } = useAuth();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: tradesData, isLoading } = useTrades(token, { limit: 20, page, emotion: filter || undefined });
  const { data: stats } = useTradeStats(token);

  const trades = tradesData?.data || [];
  const totalPages = tradesData?.total_pages || 1;

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Trade History</h1>
        <p className="mt-1 text-sm text-[#64748b]">All your trades with emotional analysis</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 stagger-children">
        {[
          { label: "Total Trades", value: stats?.total_trades?.toString() || "0", icon: "📊", color: "from-purple-500/15 to-purple-600/5", border: "border-purple-500/10" },
          { label: "Win Rate", value: `${stats?.win_rate || 0}%`, icon: "🎯", color: "from-cyan-500/15 to-cyan-600/5", border: "border-cyan-500/10" },
          { label: "Total PnL", value: `$${(stats?.total_pnl || 0).toLocaleString()}`, icon: "💰", color: "from-emerald-500/15 to-emerald-600/5", border: "border-emerald-500/10" },
          { label: "Best Trade", value: `$${(stats?.biggest_win || 0).toLocaleString()}`, icon: "🏆", color: "from-amber-500/15 to-amber-600/5", border: "border-amber-500/10" },
        ].map((s) => (
          <div key={s.label} className={`stat-glow overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-br ${s.color} p-4`}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{s.icon}</span>
              <div>
                <p className="text-xl font-bold font-mono text-white">{s.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748b]">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {emotionFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
              filter === f.key
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)] scale-[1.02]"
                : "border border-white/[0.06] bg-white/[0.02] text-[#94a3b8] hover:border-purple-500/20 hover:bg-purple-500/5 hover:text-purple-300"
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card hoverable={false}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="h-12 shimmer rounded-xl" style={{ animationDelay: `${i * 80}ms` }} />)}
            </div>
          ) : trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] text-4xl">📭</div>
              <p className="mt-4 text-sm font-medium text-[#94a3b8]">No trades found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Trade</th>
                    <th className="py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Chain</th>
                    <th className="py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Value</th>
                    <th className="py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#475569]">PnL</th>
                    <th className="py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Emotion</th>
                    <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#475569]">Hold Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade: any, i: number) => (
                    <tr key={trade.id} className="table-row-hover border-b border-white/[0.02] cursor-pointer transition-all" style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border border-purple-500/10 text-xs font-bold text-purple-300">
                            {(trade.token_out || "?")[0]}
                          </div>
                          <span className="font-semibold text-white text-sm">{trade.token_out || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-3.5"><ChainIcon chain={trade.chain || "ETH"} size="sm" /></td>
                      <td className="py-3.5 text-right font-mono text-sm font-medium text-white">{formatUSD(trade.value_usd || 0)}</td>
                      <td className="py-3.5 text-right"><PnLDisplay value={trade.pnl_usd || 0} percent={trade.pnl_percent || 0} size="sm" /></td>
                      <td className="py-3.5">
                        {trade.emotion_tag ? <EmotionBadge emotion={trade.emotion_tag} score={trade.emotion_score || 0} size="sm" /> : <span className="text-xs text-[#475569]">—</span>}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/[0.04] p-4">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#94a3b8] transition-all hover:border-purple-500/20 hover:text-purple-300 disabled:opacity-30">
                ← Previous
              </button>
              <span className="text-xs text-[#64748b]">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#94a3b8] transition-all hover:border-purple-500/20 hover:text-purple-300 disabled:opacity-30">
                Next →
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
