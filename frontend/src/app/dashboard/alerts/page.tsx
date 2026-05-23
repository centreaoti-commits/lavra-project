"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/providers/auth-provider";
import { useAlerts, useMarkAlertRead, useUpdateAlertSettings } from "@/hooks/use-alerts";
import { formatTimeAgo } from "@/lib/format";

const severityConfig: Record<string, { border: string; bg: string; icon: string; glow: string }> = {
  critical: { border: "border-l-red-500", bg: "bg-red-500/[0.04]", icon: "🔴", glow: "hover:shadow-[0_0_24px_rgba(239,68,68,0.08)]" },
  warning: { border: "border-l-amber-500", bg: "bg-amber-500/[0.04]", icon: "🟡", glow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.08)]" },
  positive: { border: "border-l-emerald-500", bg: "bg-emerald-500/[0.04]", icon: "🟢", glow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.08)]" },
  info: { border: "border-l-cyan-500", bg: "bg-cyan-500/[0.04]", icon: "🔵", glow: "hover:shadow-[0_0_24px_rgba(6,182,212,0.08)]" },
};

export default function AlertsPage() {
  const { token } = useAuth();
  const updateAlertSettings = useUpdateAlertSettings(token);
  const { data, isLoading } = useAlerts(token);
  const markRead = useMarkAlertRead(token);

  const alerts = data?.data || [];
  const unreadCount = alerts.filter((a: any) => !a.is_read).length;

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Alerts</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Real-time emotional trading alerts {unreadCount > 0 && <span className="text-purple-300">({unreadCount} unread)</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        {[
          { label: "Total Alerts", value: data?.total || 0, icon: "🔔", color: "text-white", gradient: "from-purple-500/15 to-purple-600/5", border: "border-purple-500/10" },
          { label: "Unread", value: unreadCount, icon: "📬", color: "text-purple-300", gradient: "from-amber-500/15 to-amber-600/5", border: "border-amber-500/10" },
          { label: "Positive", value: alerts.filter((a: any) => a.type === "positive").length, icon: "✨", color: "text-emerald-300", gradient: "from-emerald-500/15 to-emerald-600/5", border: "border-emerald-500/10" },
        ].map((stat) => (
          <div key={stat.label} className={`stat-glow overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.gradient} p-5`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.06] text-lg">
                {stat.icon}
              </div>
              <div>
                <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748b]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts list */}
      {isLoading ? (
        <div className="space-y-3 stagger-children">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 shimmer rounded-2xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] text-4xl">
            🔔
          </div>
          <p className="mt-4 text-sm font-medium text-[#94a3b8]">No alerts yet</p>
          <p className="mt-1 text-xs text-[#475569]">Alerts will appear when emotional patterns are detected</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {alerts.map((alert: any) => {
            const config = severityConfig[alert.severity] || severityConfig.info;
            return (
              <div
                key={alert.id}
                className={`glass-card group border-l-4 ${config.border} ${config.glow} cursor-pointer p-5 ${
                  !alert.is_read ? "ring-1 ring-purple-500/20" : ""
                }`}
                onClick={() => {
                  if (!alert.is_read) markRead.mutate(alert.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">{config.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
                      {!alert.is_read && (
                        <span className="flex h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[#94a3b8]">{alert.message}</p>
                    <p className="mt-2 text-[11px] text-[#475569]">{formatTimeAgo(alert.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-sm">⚙️</span>
            Alert Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "FOMO Alerts", description: "When you're about to buy a pumping token", key: "fomo_alerts", icon: "🏃" },
              { label: "Revenge Trade Alerts", description: "When you're trading after a loss", key: "revenge_alerts", icon: "😤" },
              { label: "Overtrade Alerts", description: "When you exceed your daily trade limit", key: "overtrade_alerts", icon: "🎰" },
              { label: "Panic Sell Alerts", description: "When you're selling during a dip", key: "panic_alerts", icon: "😱" },
              { label: "Daily Summary", description: "Daily report of your trading behavior", key: "daily_summary", icon: "📊" },
              { label: "Weekly Report", description: "Comprehensive weekly analysis", key: "weekly_report", icon: "📈" },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all hover:border-purple-500/10 hover:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{setting.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{setting.label}</p>
                    <p className="text-xs text-[#475569]">{setting.description}</p>
                  </div>
                </div>
                <Switch checked={true} onCheckedChange={(checked) => updateAlertSettings.mutate({ [setting.key]: checked } as Record<string, boolean>)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
