import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, color, size = "md", showLabel = false, animated = true, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizes = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    const defaultColor = percentage <= 30 ? "#10b981" : percentage <= 60 ? "#f59e0b" : percentage <= 80 ? "#f97316" : "#ef4444";

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showLabel && (
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-text-secondary">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn("w-full overflow-hidden rounded-full bg-surface-border", sizes[size])}>
          <div
            className={cn(
              "h-full rounded-full transition-all",
              animated && "animate-score-fill"
            )}
            style={{
              width: `${percentage}%`,
              backgroundColor: color || defaultColor,
              ["--score-width" as string]: `${percentage}%`,
            }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
