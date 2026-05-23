import { cn } from "@/lib/utils";
import { getScoreColor } from "@/lib/format";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ScoreGauge({ score, size = "md", label, showValue = true, className }: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const radius = size === "sm" ? 36 : size === "md" ? 48 : 60;
  const stroke = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = (radius + stroke) * 2;
  const center = radius + stroke;

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-bold font-mono", textSizes[size])} style={{ color }}>
              {score}
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="mt-2 text-xs text-text-secondary">{label}</span>
      )}
    </div>
  );
}
