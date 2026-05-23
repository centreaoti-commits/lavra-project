import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/shared/gradient-text";

export function CTASection() {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 radial-glow" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
          Ready to understand your <GradientText>trading psychology</GradientText>?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          Join thousands of traders who finally understand why they lose money — and are fixing it with data.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/onboarding">
            <Button size="xl" variant="glow">
              🧠 Analyze My Wallet — Free
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-text-muted">
          No sign-up • No permissions • Takes 60 seconds
        </p>
      </div>
    </section>
  );
}
