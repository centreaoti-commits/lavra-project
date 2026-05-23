"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/shared/score-gauge";

export default function ReportsPage() {
  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-[#64748b]">Your behavioral analysis reports</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm font-medium text-[#94a3b8] transition-all hover:border-purple-500/20 hover:bg-purple-500/5 hover:text-purple-300">
          📥 Export PDF
        </button>
      </div>

      {/* Weekly Report */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-base">📊</span>
              Weekly Report — Jan 14-20, 2025
            </CardTitle>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              ✓ Improved
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Summary */}
          <div className="overflow-hidden rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-500/[0.06] to-cyan-500/[0.03] p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="text-base">🧠</span> AI Summary
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
              This week was a <span className="font-semibold text-amber-300">mixed bag</span>. You improved your FOMO score by 15 points (great work!), but revenge trading increased after your PEPE loss on Tuesday. Your best day was Saturday with zero emotional trades. Key insight: <span className="font-semibold text-purple-300">your planned trades had a 68% win rate</span> while emotional trades had only 23%.
            </p>
          </div>

          {/* Scores */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Emotional Scores</h3>
            <div className="grid grid-cols-5 gap-3 stagger-children">
              {[
                { label: "FOMO", score: 72, prev: 87, emoji: "🏃", color: "#ef4444" },
                { label: "Panic", score: 45, prev: 52, emoji: "😱", color: "#f59e0b" },
                { label: "Revenge", score: 38, prev: 28, emoji: "😤", color: "#f97316" },
                { label: "Overtrade", score: 55, prev: 61, emoji: "🎰", color: "#8b5cf6" },
                { label: "Diamond", score: 35, prev: 30, emoji: "💎", color: "#06b6d4" },
              ].map((item) => {
                const diff = item.score - item.prev;
                const isGood = (diff < 0 && item.label !== "Diamond") || (diff > 0 && item.label === "Diamond");
                return (
                  <div key={item.label} className="stat-glow rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-center">
                    <ScoreGauge score={item.score} size="sm" />
                    <p className="mt-2 text-xs font-medium text-[#94a3b8]">{item.emoji} {item.label}</p>
                    <p className={`mt-1 text-xs font-bold ${isGood ? "text-emerald-400" : "text-red-400"}`}>
                      {diff > 0 ? "+" : ""}{diff}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 stagger-children">
            {[
              { label: "Trades", value: "12", sub: "vs 18 last week", icon: "📊" },
              { label: "Win Rate", value: "42%", sub: "vs 38% last week", icon: "🎯" },
              { label: "Net PnL", value: "-$180", sub: "vs -$620 last week", icon: "💰" },
              { label: "Emotional Loss", value: "$240", sub: "vs -$580 last week", icon: "💸" },
            ].map((stat) => (
              <div key={stat.label} className="stat-glow rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 text-center">
                <span className="text-lg">{stat.icon}</span>
                <p className="mt-1 text-xl font-bold font-mono text-white">{stat.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748b]">{stat.label}</p>
                <p className="mt-1 text-[10px] text-[#475569]">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <span>🔍</span> Key Insights
            </h3>
            <div className="space-y-2 stagger-children">
              {[
                { type: "success", text: "FOMO score improved 15 points — your best week yet!" },
                { type: "success", text: "Held SOL position for 7 days through volatility — diamond hands!" },
                { type: "warning", text: "Revenge trading increased after PEPE loss on Tuesday" },
                { type: "danger", text: "WIF panic sell at -24% — if you held, you'd be +8% now" },
                { type: "success", text: "Best day: Saturday — zero emotional trades, +$380" },
              ].map((insight, i) => {
                const config = {
                  success: { bg: "bg-emerald-500/[0.06]", border: "border-emerald-500/10", icon: "🟢", text: "text-emerald-300" },
                  warning: { bg: "bg-amber-500/[0.06]", border: "border-amber-500/10", icon: "🟡", text: "text-amber-300" },
                  danger: { bg: "bg-red-500/[0.06]", border: "border-red-500/10", icon: "🔴", text: "text-red-300" },
                }[insight.type]!;
                return (
                  <div key={i} className={`flex items-start gap-3 rounded-xl ${config.bg} border ${config.border} p-3.5`}>
                    <span className="mt-0.5">{config.icon}</span>
                    <p className={`text-sm leading-relaxed ${config.text}`}>{insight.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <span>💡</span> Recommended Actions
            </h3>
            <div className="space-y-2 stagger-children">
              {[
                "Set a hard rule: No buying tokens that pumped >10% in 24h",
                "After any loss, set a 1-hour cooldown before new trades",
                "Your planned trades win 68% — try to plan every trade before executing",
                "Consider setting a max 3 trades/day rule",
              ].map((action, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-purple-500/10 bg-purple-500/[0.04] p-3.5">
                  <span className="mt-0.5 text-purple-400">→</span>
                  <p className="text-sm leading-relaxed text-[#94a3b8]">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
