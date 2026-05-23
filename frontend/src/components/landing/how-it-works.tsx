import { GradientText } from "@/components/shared/gradient-text";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect Your Wallet",
      description: "One click, no sign-up required. We only read your on-chain transaction history — zero permissions needed.",
      icon: "🔗",
    },
    {
      number: "02",
      title: "AI Analyzes Your Behavior",
      description: "Our AI scans every trade, identifies emotional patterns, and calculates your FOMO, panic, and revenge scores.",
      icon: "🧠",
    },
    {
      number: "03",
      title: "Get Your Diagnosis",
      description: "Receive a detailed report with your trading personality, key weaknesses, and the emotional patterns costing you money.",
      icon: "📊",
    },
    {
      number: "04",
      title: "Real-Time Coaching",
      description: "Get alerts when you are about to make an emotional trade. Track your improvement with daily behavioral reports.",
      icon: "🛡️",
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            How it <GradientText>works</GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            From wallet scan to full diagnosis in under 60 seconds.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-[2px] w-full bg-gradient-to-r from-primary/30 to-transparent lg:block" />
              )}

              <div className="glass-card relative p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <span className="mt-4 inline-block font-mono text-xs text-primary">{step.number}</span>
                <h3 className="mt-2 text-lg font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
