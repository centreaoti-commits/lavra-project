"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useScanResults } from "@/hooks/use-scan-results";
import { useAnalysis } from "@/hooks/use-analysis";
import { useTradeStats } from "@/hooks/use-trades";
import { useWallets } from "@/hooks/use-profile";

export function StatsBar() {
  const { token } = useAuth();
  const { data: wallets } = useWallets(token);
  const primaryWallet = wallets?.[0]?.address || null;
  const { data: analysis } = useAnalysis(primaryWallet, token);
  const { data: stats } = useTradeStats(token);

  // Fallback to scan results (reactive)
  const scanResults = useScanResults();

  const scores = analysis?.scores || scanResults?.scores;
  const overallScore = scores?.overall ?? 0;
  const winRate = stats?.win_rate ?? scanResults?.stats?.win_rate ?? 0;
  const totalTrades = stats?.total_trades ?? scanResults?.stats?.total_trades ?? scanResults?.trades_found ?? 0;
  const emotionalLoss = analysis?.stats?.emotional_loss ?? scanResults?.stats?.emotional_loss ?? 0;

  const statsData = [
    {
      label: "Emotional Score",
      value: overallScore.toFixed(0),
      icon: "🧠",
      gradient: "from-purple-500/20 to-purple-600/10",
      borderGlow: "border-purple-500/15",
      textGlow: "text-purple-300",
      barColor: "bg-gradient-to-r from-purple-500 to-purple-400",
      barWidth: `${overallScore}%`,
    },
    {
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      icon: "📊",
      gradient: "from-cyan-500/20 to-cyan-600/10",
      borderGlow: "border-cyan-500/15",
      textGlow: "text-cyan-300",
      barColor: "bg-gradient-to-r from-cyan-500 to-emerald-400",
      barWidth: `${winRate}%`,
    },
    {
      label: "Total Trades",
      value: totalTrades.toString(),
      icon: "📈",
      gradient: "from-emerald-500/20 to-emerald-600/10",
      borderGlow: "border-emerald-500/15",
      textGlow: "text-emerald-300",
      barColor: "bg-gradient-to-r from-emerald-500 to-emerald-400",
      barWidth: `${Math.min(totalTrades * 2, 100)}%`,
    },
    {
      label: "Emotional Loss",
      value: `$${emotionalLoss.toLocaleString()}`,
      icon: "💸",
      gradient: "from-red-500/20 to-orange-600/10",
      borderGlow: "border-red-500/15",
      textGlow: "text-red-300",
      barColor: "bg-gradient-to-r from-red-500 to-orange-400",
      barWidth: `${Math.min(emotionalLoss / 50, 100)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
      {statsData.map((stat) => (
        <div
          key={stat.label}
          className={`stat-glow group relative overflow-hidden rounded-2xl border ${stat.borderGlow} bg-gradient-to-br ${stat.gradient} p-5 backdrop-blur-sm`}
        >
          {/* Hover glow */}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.02] blur-2xl transition-all duration-500 group-hover:bg-white/[0.05] group-hover:scale-150" />
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.06] text-xl transition-transform group-hover:scale-110">
                {stat.icon}
              </div>
            </div>
            
            <p className={`mt-3 text-3xl font-bold font-mono tracking-tight ${stat.textGlow}`}>
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-medium text-[#64748b] uppercase tracking-wider">{stat.label}</p>
            
            {/* Mini progress bar */}
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className={`h-full rounded-full ${stat.barColor} transition-all duration-1000 ease-out`}
                style={{ width: stat.barWidth }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
