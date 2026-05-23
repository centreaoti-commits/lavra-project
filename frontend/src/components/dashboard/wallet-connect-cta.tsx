"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
export function WalletConnectCTA() {
  const { isConnected, address } = useAccount();
  const queryClient = useQueryClient();
  const [manualAddress, setManualAddress] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);

  // Load existing wallet from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ct_scan_results");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentWallet(parsed?.wallet_address || null);
      }
    } catch {}
  }, []);

  // Core scan function
  const doScan = useCallback(async (addr: string) => {
    setError("");
    setScanning(true);
    setProgress("Scanning wallet on-chain...");
    try {
      const result = await api.publicScan(addr, ["ethereum", "bsc", "polygon", "arbitrum", "base"]);
      setProgress("Analyzing trading patterns...");
      localStorage.setItem("ct_scan_results", JSON.stringify({
        wallet_address: addr,
        source: isConnected ? "wallet" : "manual",
        timestamp: Date.now(),
        ...result,
      }));
      setProgress("Done!");
      setCurrentWallet(addr);
      window.dispatchEvent(new Event("scan-results-updated"));
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      queryClient.invalidateQueries({ queryKey: ["tradeStats"] });
    } catch (err: any) {
      setError(err?.message || "Scan failed. Please try again.");
      setProgress("");
    } finally {
      setScanning(false);
    }
  }, [isConnected, queryClient]);

  // Auto-scan when wallet connects via RainbowKit (only if no existing scan)
  useEffect(() => {
    if (isConnected && address && !currentWallet && !scanning) {
      doScan(address);
    }
  }, [isConnected, address, currentWallet, scanning, doScan]);

  const handleManualScan = () => {
    const addr = manualAddress.trim();
    if (!addr.startsWith("0x") || addr.length !== 42) {
      setError("Enter a valid Ethereum address (0x...42 chars)");
      return;
    }
    doScan(addr);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/5 via-[#0a0a12] to-cyan-500/5 p-6 sm:p-8">
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/10 blur-[100px]" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 mb-4">
          <span className="text-3xl">🔗</span>
        </div>

        <h2 className="text-xl font-bold text-white">
          {currentWallet ? "Change Wallet" : "Enter Wallet Address"}
        </h2>
        <p className="mt-2 max-w-md text-sm text-[#94a3b8]">
          {currentWallet
            ? <>Currently analyzing: <span className="font-mono text-purple-300">{currentWallet.slice(0, 6)}...{currentWallet.slice(-4)}</span></>
            : "Connect your wallet or enter a wallet address to start analyzing your trading psychology"
          }
        </p>

        {/* Scanning progress */}
        {scanning && (
          <div className="mt-4 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-400" />
            <p className="text-sm text-purple-400">{progress}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-3 text-xs text-red-400">{error}</p>
        )}

        {/* Action buttons — hide while scanning */}
        {!scanning && (
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            {/* Connect Wallet button — only show when not connected */}
            {!isConnected && (
              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    {...(!mounted && { "aria-hidden": true, style: { opacity: 0 } })}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_4px_28px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                    </svg>
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            )}

            {!isConnected && <span className="text-xs text-[#64748b]">or</span>}

            {/* Manual address input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => { setManualAddress(e.target.value); setError(""); }}
                placeholder={currentWallet ? "New wallet 0x..." : "Enter wallet 0x..."}
                autoComplete="off"
                spellCheck={false}
                className="w-56 sm:w-64 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-[#475569] outline-none transition-all focus:border-purple-500/30 focus:bg-white/[0.05] focus:ring-1 focus:ring-purple-500/20"
                onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
              />
              <button
                onClick={handleManualScan}
                className="flex items-center gap-1.5 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition-all hover:bg-purple-500/20 hover:border-purple-500/30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {currentWallet ? "Re-scan" : "Scan"}
              </button>
            </div>
          </div>
        )}

        {/* Supported wallets */}
        {!currentWallet && (
          <div className="mt-6 flex items-center gap-4 text-[10px] text-[#475569]">
            <span>Supports:</span>
            <div className="flex items-center gap-2">
              {["MetaMask", "WalletConnect", "Coinbase", "Trust"].map((w) => (
                <span key={w} className="rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-0.5">{w}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
