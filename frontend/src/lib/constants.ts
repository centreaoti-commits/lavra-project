export const APP_NAME = "Crypto Therapist";
export const APP_DESCRIPTION = "AI-powered behavioral analysis that reveals why your trades fail. Scan any wallet in 60 seconds — discover your emotional patterns, FOMO triggers, and start trading with discipline.";

export const CHAINS = [
  { id: 1, name: "Ethereum", symbol: "ETH", color: "#627eea" },
  { id: 56, name: "BSC", symbol: "BNB", color: "#f3ba2f" },
  { id: 137, name: "Polygon", symbol: "MATIC", color: "#8247e5" },
  { id: 42161, name: "Arbitrum", symbol: "ARB", color: "#28a0f0" },
  { id: 8453, name: "Base", symbol: "BASE", color: "#0052ff" },
  { id: 10, name: "Optimism", symbol: "OP", color: "#ff0420" },
  { id: 43114, name: "Avalanche", symbol: "AVAX", color: "#e84142" },
] as const;

export const EMOTIONS = [
  { key: "fomo", label: "FOMO", emoji: "🏃", color: "#ef4444" },
  { key: "panic", label: "Panic Sell", emoji: "😱", color: "#f97316" },
  { key: "revenge", label: "Revenge", emoji: "😤", color: "#dc2626" },
  { key: "overtrade", label: "Overtrade", emoji: "🎰", color: "#f59e0b" },
  { key: "diamond", label: "Diamond Hands", emoji: "💎", color: "#10b981" },
] as const;

export const PERSONALITY_TYPES = {
  reactive_fomo: { name: "Reactive FOMO Trader", emoji: "🏃" },
  panic_seller: { name: "Panic Seller", emoji: "😱" },
  revenge_warrior: { name: "Revenge Warrior", emoji: "😤" },
  slot_machine: { name: "Slot Machine Gambler", emoji: "🎰" },
  diamond_hands: { name: "Diamond Hands", emoji: "💎" },
  cold_calculator: { name: "Cold Calculator", emoji: "🧊" },
  butterfly: { name: "Butterfly", emoji: "🦋" },
  slow_steady: { name: "Slow & Steady", emoji: "🐢" },
  mixed: { name: "Mixed Profile", emoji: "🎭" },
} as const;

export const PRICING_TIERS = [
  {
    name: "Free",
    price: 0,
    features: [
      "1 wallet",
      "Basic personality profile",
      "Weekly summary report",
      "5 alerts/month",
    ],
  },
  {
    name: "Pro",
    price: 19,
    features: [
      "Unlimited wallets",
      "Real-time intervention alerts",
      "Daily behavioral reports",
      "12-month history",
      "Personalized trading rules",
      "AI coach chat",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: 49,
    features: [
      "Everything in Pro",
      "Priority AI coaching",
      "Custom intervention rules",
      "Portfolio guardrails",
      "Community leaderboard",
      "Priority support",
    ],
  },
] as const;

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
] as const;

export const DASHBOARD_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Trade History", href: "/dashboard/history", icon: "History" },
  { label: "Alerts", href: "/dashboard/alerts", icon: "Bell" },
  { label: "Reports", href: "/dashboard/reports", icon: "FileText" },
  { label: "Profile", href: "/dashboard/profile", icon: "User" },
] as const;
