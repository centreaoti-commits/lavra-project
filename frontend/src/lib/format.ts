export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(2);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return d.toLocaleDateString();
}

export function getScoreColor(score: number): string {
  if (score <= 30) return "#10b981";
  if (score <= 60) return "#f59e0b";
  if (score <= 80) return "#f97316";
  return "#ef4444";
}

export function getScoreLabel(score: number): string {
  if (score <= 30) return "Healthy";
  if (score <= 60) return "Watch Out";
  if (score <= 80) return "Concerning";
  return "Critical";
}

export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    fomo: "#ef4444",
    panic: "#f97316",
    revenge: "#dc2626",
    overtrade: "#f59e0b",
    diamond: "#10b981",
    planned: "#8b5cf6",
    neutral: "#64748b",
  };
  return colors[emotion] || "#64748b";
}

export function getEmotionEmoji(emotion: string): string {
  const emojis: Record<string, string> = {
    fomo: "🏃",
    panic: "😱",
    revenge: "😤",
    overtrade: "🎰",
    diamond: "💎",
    planned: "🧠",
    neutral: "😐",
  };
  return emojis[emotion] || "❓";
}
