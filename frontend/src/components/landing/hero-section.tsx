"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/shared/gradient-text";
import { APP_DESCRIPTION } from "@/lib/constants"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 radial-glow" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="animate-fade-in-down mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-muted px-3 py-1.5 sm:px-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-primary-foreground">
              Trusted by 2,800+ traders worldwide
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-text-primary">Stop losing money to </span>
            <br className="hidden sm:block" />
            <GradientText>emotional trading</GradientText>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up animate-delay-200 mx-auto mt-4 sm:mt-6 max-w-2xl text-base text-text-secondary sm:text-xl">
            {APP_DESCRIPTION}
          </p>

          {/* CTA */}
          <div className="animate-fade-in-up animate-delay-300 mt-8 sm:mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button size="xl" variant="glow" className="w-full sm:w-auto">
                🧠 Analyze My Wallet — Free
              </Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                See how it works →
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in-up animate-delay-400 mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-text-muted">
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span className="text-xs sm:text-sm">No sign-up required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span className="text-xs sm:text-sm">Read-only analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-success">✓</span>
              <span className="text-xs sm:text-sm">7 chains supported</span>
            </div>
          </div>
        </div>

        {/* Preview card */}
        <div className="animate-fade-in-up animate-delay-500 mx-auto mt-10 sm:mt-16 max-w-4xl">
          <div className="glass-card overflow-hidden p-1">
            <div className="rounded-[12px] bg-surface p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                  <div>
                    <p className="font-medium text-text-primary text-sm sm:text-base">Trading Personality</p>
                    <p className="text-xs sm:text-sm text-text-secondary">Based on 847 transactions</p>
                  </div>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-danger-muted px-3 py-1 text-xs sm:text-sm text-danger">
                  🏃 Reactive FOMO Trader
                </span>
              </div>

              <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
                {[
                  { label: "FOMO", score: 72, color: "#ef4444" },
                  { label: "Panic", score: 45, color: "#f59e0b" },
                  { label: "Revenge", score: 38, color: "#f97316" },
                  { label: "Overtrade", score: 55, color: "#f59e0b" },
                  { label: "Diamond", score: 35, color: "#10b981" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="relative mx-auto h-12 w-12 sm:h-16 sm:w-16">
                      <svg width="100%" height="100%" viewBox="0 0 64 64" className="transform -rotate-90">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                        <circle
                          cx="32" cy="32" r="26" fill="none" stroke={item.color} strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 26}
                          strokeDashoffset={2 * Math.PI * 26 * (1 - item.score / 100)}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-xs sm:text-sm font-bold" style={{ color: item.color }}>
                        {item.score}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] sm:text-xs text-text-muted">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 rounded-lg bg-danger-muted p-2 sm:p-3">
                <p className="text-xs sm:text-sm text-danger">
                  <span className="font-medium">⚠️ Key insight:</span> 72% of your trades are bought after the token pumped 15%+. Estimated FOMO loss: $3,240
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
