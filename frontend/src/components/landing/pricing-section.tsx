import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/shared/gradient-text";
import { PRICING_TIERS } from "@/lib/constants";

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Simple, <GradientText>transparent</GradientText> pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Start free. Upgrade when you&apos;re ready to take your trading psychology seriously.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-[1px] ${
                "popular" in tier && tier.popular
                  ? "bg-gradient-to-b from-primary to-accent"
                  : "bg-surface-border"
              }`}
            >
              {"popular" in tier && tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-medium text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="rounded-2xl bg-background p-8">
                <h3 className="text-lg font-semibold text-text-primary">{tier.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-text-primary">
                    {tier.price === 0 ? "Free" : `\u0024${tier.price}`}
                  </span>
                  {tier.price > 0 && (
                    <span className="ml-1 text-sm text-text-muted">/month</span>
                  )}
                </div>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 text-success">✓</span>
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/onboarding" className="mt-8 block">
                  <Button
                    variant={"popular" in tier && tier.popular ? "glow" : "secondary"}
                    className="w-full"
                  >
                    {tier.price === 0 ? "Get Started Free" : "Start Pro Trial"}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
