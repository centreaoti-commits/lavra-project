"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const badges = [
  { id: "1", emoji: "🛡️", name: "FOMO-Free 3d", unlocked: true, description: "No FOMO trades for 3 consecutive days", color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/20", glow: "shadow-[0_0_16px_rgba(16,185,129,0.15)]" },
  { id: "2", emoji: "💎", name: "Diamond Hands", unlocked: true, description: "Held a position for 7+ days", color: "from-cyan-500/20 to-cyan-600/10", border: "border-cyan-500/20", glow: "shadow-[0_0_16px_rgba(6,182,212,0.15)]" },
  { id: "3", emoji: "🧘", name: "Zen Trader", unlocked: false, description: "No emotional trades for 7 days", color: "from-white/[0.03] to-white/[0.01]", border: "border-white/[0.04]", glow: "" },
  { id: "4", emoji: "📊", name: "Data-Driven", unlocked: true, description: "Made 10 planned trades in a row", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/20", glow: "shadow-[0_0_16px_rgba(139,92,246,0.15)]" },
  { id: "5", emoji: "🎯", name: "Precision", unlocked: false, description: "5 consecutive winning trades", color: "from-white/[0.03] to-white/[0.01]", border: "border-white/[0.04]", glow: "" },
  { id: "6", emoji: "🧠", name: "Self-Aware", unlocked: true, description: "Checked report 30 days straight", color: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/20", glow: "shadow-[0_0_16px_rgba(245,158,11,0.15)]" },
];

export function AchievementBadges() {
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-sm">🏆</span>
            Achievements
          </CardTitle>
          <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
            {unlockedCount}/{badges.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "group relative flex flex-col items-center rounded-xl p-3 text-center transition-all duration-300",
                badge.unlocked
                  ? `bg-gradient-to-br ${badge.color} border ${badge.border} ${badge.glow} hover:scale-[1.05] cursor-pointer`
                  : "border border-white/[0.03] bg-white/[0.01] opacity-30"
              )}
              title={badge.description}
            >
              <span className={cn(
                "text-2xl transition-transform",
                badge.unlocked && "group-hover:scale-110"
              )}>
                {badge.emoji}
              </span>
              <p className={cn(
                "mt-1.5 text-[9px] font-semibold leading-tight",
                badge.unlocked ? "text-white" : "text-[#475569]"
              )}>
                {badge.name}
              </p>
              {badge.unlocked && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
