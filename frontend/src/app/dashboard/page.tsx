"use client";

import { useMemo, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useAnalysis } from "@/hooks/use-analysis";
import { useTradeStats } from "@/hooks/use-trades";
import { useWallets } from "@/hooks/use-profile";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useScanResults } from "@/hooks/use-scan-results";

import { EmotionalRadar } from "@/components/dashboard/emotional-radar";
import { TradeTimeline } from "@/components/dashboard/trade-timeline";
import { TradesTable } from "@/components/dashboard/trades-table";
import { AiCoachChat } from "@/components/dashboard/ai-coach-chat";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { WeeklyProgress } from "@/components/dashboard/weekly-progress";
import { AchievementBadges } from "@/components/dashboard/achievement-badges";
import { WalletConnectCTA } from "@/components/dashboard/wallet-connect-cta";
import { PERSONALITY_TYPES } from "@/lib/constants";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { token } = useAuth();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const scanTriggered = useRef(false);

  // Get scan results (reactive to localStorage changes)
  const scanResults = useScanResults();

  const { data: wallets } = useWallets(token);
  const primaryWallet = wallets?.[0]?.address || scanResults?.wallet_address || null;
  const { data: analysis, isLoading: analysisLoading } = useAnalysis(primaryWallet, token);
  const { data: stats, isLoading: statsLoading } = useTradeStats(token);

  // Auto-start authenticated scan when wallet connects + login completes
  useEffect(() => {
    if (token && address && !scanTriggered.current) {
      scanTriggered.current = true;
      api.startScan(token, address, ["ETH", "BSC", "POLYGON", "ARBITRUM", "BASE"])
        .then((result) => {
          // If inline mode, update localStorage and refresh
          if (result && (result as any).trades_found !== undefined) {
            localStorage.setItem("ct_scan_results", JSON.stringify({
              ...result,
              wallet_address: address,
              source: "authenticated",
              timestamp: Date.now(),
            }));
            window.dispatchEvent(new Event("scan-results-updated"));
            queryClient.invalidateQueries({ queryKey: ["analysis"] });
            queryClient.invalidateQueries({ queryKey: ["trades"] });
            queryClient.invalidateQueries({ queryKey: ["tradeStats"] });
          }
        })
        .catch(() => {
          // Scan failed — that's OK, existing data still shows
        });
    }
  }, [token, address, queryClient]);

  // Use API data if available, otherwise fall back to scan results
  const displayAnalysis = analysis || scanResults;
  const personalityKey = displayAnalysis?.personality?.key || displayAnalysis?.personality?.type || "mixed";
  const personalityInfo = PERSONALITY_TYPES[personalityKey as keyof typeof PERSONALITY_TYPES] || PERSONALITY_TYPES.mixed;

  if (analysisLoading && !scanResults) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg">🧠</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">Analyzing your trading psychology</p>
            <p className="mt-1 text-xs text-[#64748b]">This may take a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Welcome back <span className="inline-block animate-[wave_0.5s_ease-in-out]">👋</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748b]">Your trading psychology report is ready</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge-glow rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-purple-300">
            {personalityInfo.emoji} {personalityInfo.name}
          </div>
        </div>
      </div>

      {/* Wallet Connect CTA — always visible */}
      <WalletConnectCTA />

      {/* Stats */}
      <StatsBar />

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-5 lg:col-span-2 stagger-children">
          <EmotionalRadar />
          <TradeTimeline />
          <TradesTable />
        </div>
        <div className="space-y-4 sm:space-y-5 stagger-children">
          <AiCoachChat />
          <WeeklyProgress />
          <AchievementBadges />
        </div>
      </div>
    </div>
  );
}
