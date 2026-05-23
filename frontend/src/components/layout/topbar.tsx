"use client";

import { useMemo } from "react";
import { AddressDisplay } from "@/components/shared/address-display";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/components/providers/auth-provider";
import { useAlerts } from "@/hooks/use-alerts";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { address } = useAccount();
  const { token } = useAuth();
  const { data: alertsData } = useAlerts(token);
  const unreadCount = alertsData?.data?.filter((a: any) => !a.is_read).length || 0;

  // Get wallet address from connected wallet or scan results
  const displayAddress = useMemo(() => {
    if (address) return address;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ct_scan_results");
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.wallet_address || null;
        }
      } catch {}
    }
    return null;
  }, [address]);

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-white/[0.04] bg-[#06060a]/80 px-4 sm:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-lg p-1.5 text-[#64748b] hover:text-white hover:bg-white/[0.05] lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">Dashboard</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Network indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs text-[#94a3b8]">Monitoring</span>
        </div>

        {/* Notifications */}
        <button className="group relative rounded-xl border border-white/[0.04] bg-white/[0.02] p-2 sm:p-2.5 text-[#64748b] transition-all hover:border-purple-500/20 hover:bg-purple-500/5 hover:text-purple-300">
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-1 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Connect Wallet / Wallet Display */}
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-purple-300 transition-all hover:border-purple-500/50 hover:from-purple-600/30 hover:to-cyan-600/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] active:scale-[0.97]"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                        </svg>
                        <span className="hidden sm:inline">Connect Wallet</span>
                        <span className="sm:hidden">Connect</span>
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      {/* Chain badge */}
                      <button
                        onClick={openChainModal}
                        className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-[#94a3b8] transition-all hover:border-purple-500/15"
                      >
                        {chain.hasIcon && (
                          <div className="h-4 w-4 rounded-full overflow-hidden">
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain"}
                                src={chain.iconUrl}
                                className="h-4 w-4"
                              />
                            )}
                          </div>
                        )}
                        <span>{chain.name}</span>
                      </button>

                      {/* Account button */}
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2 sm:px-3 py-1.5 transition-all hover:border-purple-500/15 hover:bg-purple-500/5"
                      >
                        <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 p-[1px]">
                          <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#0a0a12]">
                            <span className="text-[9px] sm:text-[10px] font-bold text-purple-300">
                              {account.displayName?.[0]?.toUpperCase() || "W"}
                            </span>
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-start">
                          <span className="text-xs font-medium text-white">{account.displayName}</span>
                          <span className="text-[10px] text-[#64748b]">{account.displayBalance}</span>
                        </div>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
