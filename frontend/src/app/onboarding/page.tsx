"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { LoadingScan } from "@/components/shared/loading-scan";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { GradientText } from "@/components/shared/gradient-text";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";

type Step = "connect" | "scanning" | "results";

export default function OnboardingPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { login, isAuthenticated, token } = useAuth();

  const [step, setStep] = useState<Step>("connect");
  const [manualAddress, setManualAddress] = useState("");
  const [progress, setProgress] = useState(0);
  const [transactionsFound, setTransactionsFound] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const scanStarted = useRef(false);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && step === "connect") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, step, router]);

  // Start the simulated progress bar
  const startProgress = useCallback(() => {
    setProgress(10);
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        return p + Math.random() * 5;
      });
      setTransactionsFound((t) => t + Math.floor(Math.random() * 3));
    }, 500);
    progressRef.current = progressInterval;
    return progressInterval;
  }, []);

  // Public scan — no wallet connection required (for manual address input)
  const handlePublicScan = useCallback(async (walletAddress: string) => {
    setError(null);
    setStep("scanning");
    scanStarted.current = true;

    const progressInterval = startProgress();

    try {
      setProgress(30);
      const result = await api.publicScan(walletAddress, ["ETH", "BSC", "POLYGON", "ARBITRUM", "BASE"]);

      setProgress(80);
      setTransactionsFound(result.trades_found || 0);

      setProgress(100);
      clearInterval(progressInterval);

      // Save results to localStorage so dashboard can access them
      localStorage.setItem("ct_scan_results", JSON.stringify({
        ...result,
        wallet_address: walletAddress,
        scan_type: "public",
        timestamp: Date.now(),
      }));

      setResults(result);
      setTimeout(() => {
        setStep("results");
        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => router.push("/dashboard"), 2000);
      }, 800);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Scan failed. Please try again.");
      setStep("connect");
      scanStarted.current = false;
    }
  }, [startProgress, router]);

  // Authenticated scan — for wallet-connected users
  const handleAuthScan = useCallback(async (walletAddress: string) => {
    setError(null);
    setStep("scanning");
    scanStarted.current = true;

    // Authenticate if needed
    if (!isAuthenticated) {
      try {
        setProgress(5);
        await login();
      } catch (err) {
        setError("Failed to sign message. Please try again.");
        setStep("connect");
        scanStarted.current = false;
        return;
      }
    }

    const progressInterval = startProgress();

    try {
      setProgress(15);
      const authToken = token || localStorage.getItem("ct_token");

      if (!authToken) {
        throw new Error("Authentication failed. Please reconnect your wallet.");
      }

      setProgress(30);
      const scanResponse = await api.startScan(authToken, walletAddress, [
        "ETH", "BSC", "POLYGON", "ARBITRUM", "BASE",
      ]);

      setProgress(50);

      // Handle both async (Celery) and inline modes
      let result;
      if (scanResponse.mode === "inline" || !scanResponse.task_id) {
        result = scanResponse as unknown as import("@/lib/api").ScanResult;
      } else {
        // Async mode: poll for completion
        let pollResult;
        let attempts = 0;
        const maxAttempts = 120;
        while (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1000));
          pollResult = await api.scanStatus(authToken, scanResponse.task_id);

          if (pollResult.status === "complete") break;
          if (pollResult.status === "failed") throw new Error(pollResult.error || "Scan failed");

          setProgress(50 + (attempts / maxAttempts) * 30);
          attempts++;
        }

        if (!pollResult || pollResult.status !== "complete") {
          throw new Error("Scan timed out. Please try again.");
        }
        result = pollResult.result!;
      }

      setProgress(80);
      setTransactionsFound(result.trades_found || 0);

      setProgress(100);
      clearInterval(progressInterval);

      // Save results to localStorage so dashboard can access them
      localStorage.setItem("ct_scan_results", JSON.stringify({
        ...result,
        wallet_address: walletAddress,
        scan_type: "authenticated",
        timestamp: Date.now(),
      }));

      setResults(result);
      setTimeout(() => {
        setStep("results");
        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => router.push("/dashboard"), 2000);
      }, 800);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Scan failed. Please try again.");
      setStep("connect");
      scanStarted.current = false;
    }
  }, [isAuthenticated, token, login, startProgress, router]);

  // Auto-scan when wallet connects (from RainbowKit modal)
  useEffect(() => {
    if (isConnected && address && step === "connect" && !scanStarted.current) {
      const addrToScan = pendingAddress || address;
      setPendingAddress(null);
      handleAuthScan(addrToScan);
    }
  }, [isConnected, address, step, pendingAddress, handleAuthScan]);

  const currentStep =
    progress < 15
      ? "Connecting to blockchain..."
      : progress < 40
      ? "Fetching transactions..."
      : progress < 60
      ? "Analyzing trade patterns..."
      : progress < 80
      ? "Calculating emotional scores..."
      : "Generating personality profile...";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Step: Connect */}
        {step === "connect" && (
          <div className="flex flex-col items-center text-center animate-fade-in">
            <span className="text-5xl sm:text-6xl">🧠</span>
            <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-text-primary sm:text-4xl">
              Let&apos;s analyze your <GradientText>trading psychology</GradientText>
            </h1>
            <p className="mt-3 sm:mt-4 max-w-xl text-base sm:text-lg text-text-secondary">
              Connect your wallet or paste any address to reveal emotional trading patterns — no sign-up needed.
            </p>

            {error && (
              <div className="mt-4 w-full max-w-md rounded-xl bg-danger-muted p-4 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="mt-8 sm:mt-10 w-full max-w-md space-y-4 px-2 sm:px-0">
              {/* Primary: Connect Wallet via RainbowKit */}
              <div className="glass-card p-6">
                <p className="mb-4 text-sm text-text-secondary font-medium">Option 1 — Connect your wallet:</p>
                <Button
                  className="w-full"
                  size="lg"
                  variant="glow"
                  onClick={() => openConnectModal?.()}
                >
                  🔗 Connect Wallet
                </Button>
                <p className="mt-3 text-xs text-text-muted text-center">
                  MetaMask · WalletConnect · Coinbase Wallet &amp; more
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-surface-border" />
                <span className="text-xs text-text-muted">or paste any address</span>
                <div className="h-[1px] flex-1 bg-surface-border" />
              </div>

              {/* Secondary: Manual address input — NO wallet connection needed */}
              <div className="glass-card p-6">
                <p className="mb-4 text-sm text-text-secondary">Option 2 — Analyze any wallet:</p>
                <input
                  type="text"
                  placeholder="0x... (paste any wallet address)"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value.trim())}
                  className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  className="mt-4 w-full"
                  size="lg"
                  onClick={() => handlePublicScan(manualAddress)}
                  disabled={!manualAddress.startsWith("0x") || manualAddress.length !== 42}
                >
                  🔍 Analyze Wallet
                </Button>
              </div>
            </div>

            <p className="mt-6 text-xs text-text-muted">
              Read-only analysis · No wallet permissions needed · Your data stays private
            </p>
          </div>
        )}

        {/* Step: Scanning */}
        {step === "scanning" && (
          <div className="flex flex-col items-center pt-12">
            <LoadingScan progress={progress} step={currentStep} transactionsFound={transactionsFound} />
          </div>
        )}

        {/* Step: Results */}
        {step === "results" && results && (
          <div className="animate-fade-in space-y-6 sm:space-y-8">
            <div className="text-center">
              <span className="text-5xl sm:text-6xl">{results.personality?.emoji || "🧠"}</span>
              <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-text-primary">
                You are a <GradientText>{results.personality?.name || "Unknown"}</GradientText>
              </h1>
              <p className="mt-2 text-base sm:text-lg text-text-secondary px-2">{results.personality?.description || ""}</p>
            </div>

            <div className="glass-card p-4 sm:p-8">
              <h2 className="text-center text-base sm:text-lg font-semibold text-text-primary">Emotional Scores</h2>
              <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
                {[
                  { label: "FOMO", score: results.scores?.fomo || 0, emoji: "🏃" },
                  { label: "Panic", score: results.scores?.panic || 0, emoji: "😱" },
                  { label: "Revenge", score: results.scores?.revenge || 0, emoji: "😤" },
                  { label: "Overtrade", score: results.scores?.overtrade || 0, emoji: "🎰" },
                  { label: "Diamond", score: results.scores?.diamond_hands || 0, emoji: "💎" },
                ].map((item) => (
                  <ScoreGauge key={item.label} score={item.score} label={`${item.emoji} ${item.label}`} size="md" />
                ))}
              </div>
            </div>

            {results.insights && results.insights.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-text-primary">🔍 Key Insights</h2>
                <div className="mt-4 space-y-3">
                  {results.insights.map((insight: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-surface-hover p-3">
                      <span>💡</span>
                      <p className="text-sm text-text-secondary">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.stats && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Total Trades", value: results.stats.total_trades || 0 },
                  { label: "Win Rate", value: `${results.stats.win_rate || 0}%` },
                  { label: "Total PnL", value: "$" + (results.stats.total_pnl || 0).toLocaleString() },
                  { label: "Emotional Loss", value: "$" + (results.stats.emotional_loss || 0).toLocaleString() },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-text-primary font-mono">{stat.value}</p>
                    <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col items-center gap-3 sm:gap-4 pt-4 w-full sm:w-auto">
              <Button size="xl" variant="glow" className="w-full sm:w-auto" onClick={() => {
                scanStarted.current = false;
                setStep("connect");
                setResults(null);
                setProgress(0);
                setTransactionsFound(0);
                setManualAddress("");
              }}>
                🔄 Scan Another Wallet
              </Button>
              <p className="text-sm text-text-muted">Or connect your wallet to save results and track progress</p>
              <Button size="lg" variant="secondary" onClick={() => openConnectModal?.()}>
                🔗 Connect Wallet to Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
