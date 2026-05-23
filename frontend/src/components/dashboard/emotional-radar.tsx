"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useAnalysis } from "@/hooks/use-analysis";
import { useWallets } from "@/hooks/use-profile";
import { useScanResults } from "@/hooks/use-scan-results";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export function EmotionalRadar() {
  const { token } = useAuth();
  const { data: wallets } = useWallets(token);
  const primaryWallet = wallets?.[0]?.address || null;
  const { data: analysis } = useAnalysis(primaryWallet, token);

  // Fallback to scan results (reactive)
  const scanResults = useScanResults();

  const scores = analysis?.scores || scanResults?.scores;

  const data = [
    { subject: "FOMO", score: scores?.fomo ?? 0, fullMark: 100, emoji: "🏃", color: "#ef4444" },
    { subject: "Panic", score: scores?.panic ?? 0, fullMark: 100, emoji: "😱", color: "#f59e0b" },
    { subject: "Revenge", score: scores?.revenge ?? 0, fullMark: 100, emoji: "😤", color: "#f97316" },
    { subject: "Overtrade", score: scores?.overtrade ?? 0, fullMark: 100, emoji: "🎰", color: "#8b5cf6" },
    { subject: "Diamond", score: scores?.diamond_hands ?? 0, fullMark: 100, emoji: "💎", color: "#06b6d4" },
  ];

  const getScoreLevel = (score: number) => {
    if (score <= 25) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score <= 50) return { label: "Good", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };
    if (score <= 75) return { label: "Warning", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { label: "Critical", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
  };

  const getColor = (score: number) => {
    if (score <= 25) return "#10b981";
    if (score <= 50) return "#06b6d4";
    if (score <= 75) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-base">🧠</span>
            Emotional Profile
          </CardTitle>
          <div className="flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span className="text-[10px] font-medium text-purple-300">LIVE</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="65%">
              <PolarGrid stroke="rgba(139,92,246,0.08)" gridType="polygon" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={({ x, y, payload }) => {
                  const item = data.find(d => d.subject === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text textAnchor="middle" dy={4} fill="#94a3b8" fontSize={11} fontWeight={500}>
                        {item?.emoji} {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar 
                name="Score" 
                dataKey="score" 
                stroke="#8b5cf6" 
                fill="url(#radarGradient)" 
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 2, stroke: "#0a0a0f" }}
              />
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 10, 15, 0.95)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "12px",
                  color: "#f1f5f9",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score bars */}
        <div className="mt-2 space-y-2.5">
          {data.map((item, i) => {
            const level = getScoreLevel(item.score);
            return (
              <div 
                key={item.subject} 
                className="group flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-white/[0.02]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="w-7 text-center text-sm">{item.emoji}</span>
                <span className="w-20 text-xs font-medium text-[#94a3b8]">{item.subject}</span>
                <div className="flex-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${item.score}%`, 
                        background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                        boxShadow: `0 0 8px ${item.color}40`
                      }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right font-mono text-xs font-bold" style={{ color: item.color }}>
                  {item.score}
                </span>
                <span className={`rounded-md ${level.bg} border ${level.border} px-1.5 py-0.5 text-[9px] font-semibold ${level.color}`}>
                  {level.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
