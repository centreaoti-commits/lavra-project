"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const data = [
  { day: "Mon", score: 72, fomo: 78, panic: 65 },
  { day: "Tue", score: 68, fomo: 70, panic: 55 },
  { day: "Wed", score: 74, fomo: 80, panic: 60 },
  { day: "Thu", score: 65, fomo: 62, panic: 48 },
  { day: "Fri", score: 58, fomo: 55, panic: 42 },
  { day: "Sat", score: 52, fomo: 48, panic: 38 },
  { day: "Sun", score: 48, fomo: 45, panic: 35 },
];

export function WeeklyProgress() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-sm">📈</span>
            Weekly Progress
          </CardTitle>
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5">
            <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-[10px] font-bold text-emerald-400">-24 pts</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: "#475569", fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#475569", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 10, 15, 0.95)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "12px",
                  color: "#f1f5f9",
                  fontSize: "11px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#scoreGradient)"
                dot={{ fill: "#8b5cf6", r: 3, strokeWidth: 2, stroke: "#0a0a0f" }}
                name="Overall"
              />
              <Line
                type="monotone"
                dataKey="fomo"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="FOMO"
              />
              <Line
                type="monotone"
                dataKey="panic"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Panic"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-[#64748b]">
          <span className="flex items-center gap-1.5">
            <span className="h-[2px] w-3 rounded bg-purple-500" /> Overall
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[2px] w-3 rounded bg-red-500" /> FOMO
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[2px] w-3 rounded bg-amber-500" /> Panic
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
