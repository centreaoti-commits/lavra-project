import { GradientText } from "@/components/shared/gradient-text";

export function ProblemSection() {
  const problems = [
    {
      emoji: "🏃",
      title: "FOMO Buying",
      stat: "72%",
      description: "of retail traders buy after a token has already pumped — consistently buying the top.",
    },
    {
      emoji: "😱",
      title: "Panic Selling",
      stat: "$4.2B",
      description: "lost annually by traders who sell at the bottom during market dips and corrections.",
    },
    {
      emoji: "😤",
      title: "Revenge Trading",
      stat: "3x",
      description: "larger position sizes after a loss — chasing recovery and compounding the damage.",
    },
    {
      emoji: "🎰",
      title: "Overtrading",
      stat: "68%",
      description: "of active traders would be more profitable by making fewer, more deliberate trades.",
    },
  ];

  return (
    <section className="py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary sm:text-4xl">
            The problem isn&apos;t your <GradientText>strategy</GradientText>
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-base sm:text-lg text-text-secondary">
            Most traders lose money because of emotional decisions — not lack of knowledge. You know what to do, but discipline is the real challenge.
          </p>
        </div>

        <div className="mt-10 sm:mt-16 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem) => (
            <div key={problem.title} className="glass-card p-4 sm:p-6 text-center">
              <span className="text-3xl sm:text-4xl">{problem.emoji}</span>
              <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-text-primary">{problem.stat}</p>
              <h3 className="mt-2 text-sm sm:text-lg font-semibold text-text-primary">{problem.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-text-muted">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
