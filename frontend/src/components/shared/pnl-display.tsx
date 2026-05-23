import { cn } from "@/lib/utils";
import { formatUSD, formatPercent } from "@/lib/format";

interface PnLDisplayProps {
  value: number;
  percent?: number;
  size?: "sm" | "md" | "lg";
  showSign?: boolean;
  className?: string;
}

export function PnLDisplay({ value, percent, size = "md", showSign = true, className }: PnLDisplayProps) {
  const isPositive = value >= 0;
  const color = isPositive ? "text-success" : "text-danger";
  const bgColor = isPositive ? "bg-success-muted" : "bg-danger-muted";

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-bold",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn(color, textSizes[size])}>
        {showSign && isPositive ? "+" : ""}
        {formatUSD(value)}
      </span>
      {percent !== undefined && (
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", bgColor, color)}>
          {formatPercent(percent)}
        </span>
      )}
    </div>
  );
}
