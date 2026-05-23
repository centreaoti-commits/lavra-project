"use client";

import { cn } from "@/lib/utils";

interface LoadingScanProps {
  progress: number;
  step: string;
  transactionsFound?: number;
  className?: string;
}

export function LoadingScan({ progress, step, transactionsFound, className }: LoadingScanProps) {
  const steps = [
    { label: "Connecting to blockchain", range: [0, 15] },
    { label: "Fetching transactions", range: [15, 40] },
    { label: "Analyzing trade patterns", range: [40, 60] },
    { label: "Calculating emotional scores", range: [60, 80] },
    { label: "Generating personality profile", range: [80, 100] },
  ];

  return (
    <div className={cn("flex flex-col items-center gap-8", className)}>
      {/* Brain animation */}
      <div className="relative h-32 w-32">
        <div className="absolute inset-0 animate-glow-pulse rounded-full bg-primary/20" />
        <div className="absolute inset-4 rounded-full bg-primary/10 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl">🧠</span>
        </div>
        {/* Rotating ring */}
        <svg className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: "3s" }}>
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="2"
            strokeDasharray="10 10"
          />
        </svg>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-text-secondary">{step}</span>
          <span className="font-mono text-sm text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-md space-y-3">
        {steps.map((s) => {
          const isActive = progress >= s.range[0] && progress < s.range[1];
          const isComplete = progress >= s.range[1];

          return (
            <div key={s.label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isComplete && "bg-success text-white",
                  isActive && "bg-primary text-white animate-pulse",
                  !isComplete && !isActive && "bg-surface-border text-text-muted"
                )}
              >
                {isComplete ? "✓" : isActive ? "●" : "○"}
              </div>
              <span
                className={cn(
                  "text-sm",
                  isComplete && "text-text-secondary",
                  isActive && "text-text-primary font-medium",
                  !isComplete && !isActive && "text-text-muted"
                )}
              >
                {s.label}
                {s.label === "Fetching transactions" && transactionsFound !== undefined && isActive && (
                  <span className="ml-2 font-mono text-primary">({transactionsFound} found)</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
