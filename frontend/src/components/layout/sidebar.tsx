"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV, APP_NAME } from "@/lib/constants";
import { GradientText } from "@/components/shared/gradient-text";
import { useAuth } from "@/components/providers/auth-provider";
import { useAlerts } from "@/hooks/use-alerts";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
    </svg>
  ),
  History: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bell: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  FileText: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  User: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { token } = useAuth();
  const { data: alertsData } = useAlerts(token);
  const unreadCount = alertsData?.data?.filter((a: any) => !a.is_read).length || 0;

  return (
    <aside className="flex h-full flex-col border-r border-white/[0.04] bg-[#0a0a12]" style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.04] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20">
            <span className="text-lg">🧠</span>
          </div>
          <span className="text-lg font-bold">
            <GradientText>{APP_NAME}</GradientText>
          </span>
        </div>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748b] hover:text-white hover:bg-white/[0.05] lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {DASHBOARD_NAV.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isActive
                  ? "text-white"
                  : "text-[#64748b] hover:text-[#94a3b8] hover:bg-white/[0.03]"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Active indicator */}
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/5 border border-purple-500/10" />
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-purple-400 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.5)]" />
                </>
              )}
              
              <span className={cn(
                "relative z-10 transition-colors",
                isActive ? "text-purple-300" : "group-hover:text-purple-400/60"
              )}>
                {iconMap[item.icon]}
              </span>
              <span className="relative z-10">{item.label}</span>
              
              {item.label === "Alerts" && unreadCount > 0 && (
                <span className="relative z-10 ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-1.5 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Connect Wallet / Upgrade card */}
      <div className="mx-3 mb-4 space-y-3">
        {/* Connect wallet button in sidebar */}
        <div className="overflow-hidden rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 p-4">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-purple-500/10 blur-2xl hidden lg:block" />
          <div className="relative flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/20">
              <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Connect Wallet</p>
              <p className="text-[10px] text-[#64748b]">Link your wallet for live analysis</p>
            </div>
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal, mounted, account }) => {
              if (!mounted) return null;
              if (account) return null; // Already connected, hide this section
              return (
                <button
                  onClick={openConnectModal}
                  className="relative w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-3 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_4px_24px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Connect
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Upgrade card */}
        <div className="overflow-hidden rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 p-4">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-purple-500/10 blur-2xl hidden lg:block" />
          <p className="relative text-sm font-semibold text-white">Upgrade to Pro</p>
          <p className="relative mt-1 text-xs text-[#94a3b8]">
            Unlimited wallets, real-time alerts, and AI coaching
          </p>
          <Link href="/dashboard/profile">
            <button className="relative mt-3 w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-3 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_4px_24px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98]">
              Upgrade Now
            </button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
