"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AddressDisplay } from "@/components/shared/address-display";
import { useAuth } from "@/components/providers/auth-provider";
import { useProfile, useWallets, useAddWallet, useRemoveWallet, useUpdateSettings } from "@/hooks/use-profile";

export default function ProfilePage() {
  const { token, logout } = useAuth();
  const { data: profile } = useProfile(token);
  const { data: wallets } = useWallets(token);
  const addWallet = useAddWallet(token);
  const removeWallet = useRemoveWallet(token);
  const updateSettings = useUpdateSettings(token);

  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const settings = profile?.settings || {};

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile and Settings</h1>
        <p className="mt-1 text-sm text-[#64748b]">Manage your wallets, alerts, and preferences</p>
      </div>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-sm">💳</span>
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-hidden rounded-2xl border border-purple-500/15 bg-gradient-to-r from-purple-500/[0.08] to-cyan-500/[0.04] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/15 text-2xl">
                {profile?.subscription === "premium" ? "👑" : profile?.subscription === "pro" ? "⭐" : "🆓"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-white capitalize">{profile?.subscription || "Free"} Plan</p>
                  <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">Current</span>
                </div>
                <p className="mt-0.5 text-sm text-[#94a3b8]">
                  {profile?.subscription === "free" ? "1 wallet, Basic alerts, Weekly reports" : "Unlimited wallets, Real-time alerts, AI coaching"}
                </p>
              </div>
            </div>
            {profile?.subscription === "free" && (
              <button className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_4px_24px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98]">
                Upgrade to Pro
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wallets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-sm">🔗</span>
              Connected Wallets
            </CardTitle>
            <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium text-[#64748b]">
              {wallets?.length || 0} wallets
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 stagger-children">
            {wallets?.map((wallet: any) => (
              <div key={wallet.id} className="group flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all hover:border-purple-500/10 hover:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border border-purple-500/10">
                    <span className="text-sm font-bold text-purple-300">W</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{wallet.label || "Wallet"}</span>
                      <AddressDisplay address={wallet.address} />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {wallet.chains?.map((chain: string) => (
                        <span key={chain} className="rounded-md bg-white/[0.04] border border-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-[#64748b]">
                          {chain}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 opacity-0 transition-all hover:bg-red-500/10 group-hover:opacity-100"
                  onClick={() => removeWallet.mutate(wallet.id)}
                >
                  Remove
                </button>
              </div>
            ))}

            {(!wallets || wallets.length === 0) && (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] text-3xl">🔗</div>
                <p className="mt-3 text-sm text-[#64748b]">No wallets connected</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="0x..."
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-purple-500/30 focus:bg-white/[0.04] focus:outline-none transition-all"
            />
            <input
              type="text"
              placeholder="Label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-32 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-purple-500/30 focus:bg-white/[0.04] focus:outline-none transition-all"
            />
            <button
              onClick={() => {
                if (newAddress.startsWith("0x") && newAddress.length === 42) {
                  addWallet.mutate({ address: newAddress, label: newLabel || undefined });
                  setNewAddress("");
                  setNewLabel("");
                }
              }}
              disabled={!newAddress.startsWith("0x") || newAddress.length !== 42}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
            >
              + Add
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Trading Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-sm">📏</span>
            Self-Imposed Trading Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 stagger-children">
            {[
              { label: "Max Daily Trades", key: "max_daily_trades", value: settings.max_daily_trades || 5, icon: "📊" },
              { label: "Max Trade Size", key: "max_trade_size", value: `$${(settings.max_trade_size || 1000).toLocaleString()}`, icon: "💰" },
              { label: "Alert Cooldown", key: "alert_cooldown_minutes", value: `${settings.alert_cooldown_minutes || 30}m`, icon: "⏱️" },
            ].map((rule) => (
              <div key={rule.key} className="stat-glow rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 text-center">
                <span className="text-xl">{rule.icon}</span>
                <p className="mt-2 text-2xl font-bold font-mono text-white">{String(rule.value ?? "")}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#64748b]">{rule.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-sm">🔔</span>
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 stagger-children">
            {[
              { label: "Telegram Alerts", key: "telegram_alerts", desc: "Receive alerts via Telegram bot", icon: "📱" },
              { label: "Email Alerts", key: "email_alerts", desc: "Receive alerts via email", icon: "📧" },
              { label: "Daily Summary", key: "daily_summary", desc: "Daily behavior report", icon: "📊" },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all hover:border-purple-500/10 hover:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{setting.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{setting.label}</p>
                    <p className="text-xs text-[#475569]">{setting.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={Boolean(settings[setting.key] ?? (setting.key !== "email_alerts"))}
                  onCheckedChange={(checked) => updateSettings.mutate({ [setting.key]: checked } as Record<string, boolean>)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <div className="flex justify-center pb-4">
        <button
          onClick={logout}
          className="rounded-xl border border-red-500/10 px-6 py-2.5 text-sm font-medium text-red-400 transition-all hover:border-red-500/20 hover:bg-red-500/5"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
