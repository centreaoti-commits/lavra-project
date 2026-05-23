import { GradientText } from "@/components/shared/gradient-text";

export function FeaturesGrid() {
  const features = [
    {
      icon: "🏃",
      title: "FOMO Detection",
      description: "Identify exactly when you buy the top. AI detects trades driven by fear of missing out before they cost you.",
    },
    {
      icon: "😱",
      title: "Panic Sell Alerts",
      description: "Receive real-time warnings before you sell the bottom. Catch panic-driven decisions before they happen.",
    },
    {
      icon: "😤",
      title: "Revenge Trade Blocker",
      description: "Cool-down alerts triggered after losses. Prevent revenge trading with enforced waiting periods.",
    },
    {
      icon: "🎰",
      title: "Overtrade Monitor",
      description: "Track your daily trade count with smart limits. Get notified when compulsive overtrading is detected.",
    },
    {
      icon: "💎",
      title: "Diamond Hands Score",
      description: "Measure your conviction with data. Know whether you are holding strong or just bag-holding.",
    },
    {
      icon: "🧠",
      title: "Personality Profile",
      description: "Discover your trading archetype from 8 unique profiles. Understand your weaknesses, leverage your strengths.",
    },
    {
      icon: "📊",
      title: "Emotional Loss Calculator",
      description: "See the exact dollar amount your emotional decisions have cost you. No sugarcoating — just hard data.",
    },
    {
      icon: "🤖",
      title: "AI Trading Coach",
      description: "Chat with a personal AI coach trained on YOUR data. Get actionable advice, not generic tips.",
    },
    {
      icon: "📈",
      title: "Progress Tracking",
      description: "Gamified improvement with FOMO-free streaks, achievement badges, and weekly score trends.",
    },
  ];

  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Everything you need to <GradientText>fix your trading</GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Not another chart tool. This is behavioral science applied to your on-chain data.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card group p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted transition-colors group-hover:bg-primary/20">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">{feature.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
