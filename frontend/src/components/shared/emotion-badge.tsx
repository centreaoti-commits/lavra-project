import { Badge } from "@/components/ui/badge";
import { getEmotionColor, getEmotionEmoji } from "@/lib/format";
import { cn } from "@/lib/utils";

interface EmotionBadgeProps {
  emotion: string;
  score?: number;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
  className?: string;
}

export function EmotionBadge({ emotion, score, size = "md", showScore = true, className }: EmotionBadgeProps) {
  const color = getEmotionColor(emotion);
  const emoji = getEmotionEmoji(emotion);

  const labels: Record<string, string> = {
    fomo: "FOMO",
    panic: "Panic Sell",
    revenge: "Revenge",
    overtrade: "Overtrade",
    diamond: "Diamond Hands",
    planned: "Planned",
    neutral: "Neutral",
  };

  const variant = emotion as "fomo" | "panic" | "revenge" | "overtrade" | "diamond" | "planned";

  return (
    <Badge variant={variant} className={cn("gap-1", className)}>
      <span>{emoji}</span>
      <span>{labels[emotion] || emotion}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-70">{score}</span>
      )}
    </Badge>
  );
}
