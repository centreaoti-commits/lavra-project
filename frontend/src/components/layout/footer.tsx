import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { GradientText } from "@/components/shared/gradient-text";

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <span className="text-lg font-bold">
                <GradientText>{APP_NAME}</GradientText>
              </span>
            </div>
            <p className="mt-3 max-w-md text-sm text-text-muted">
              Your AI-powered trading psychologist. Understand your emotional patterns, break bad habits, and become a better trader.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Product</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="#features" className="text-sm text-text-muted hover:text-text-secondary">Features</Link></li>
              <li><Link href="#pricing" className="text-sm text-text-muted hover:text-text-secondary">Pricing</Link></li>
              <li><Link href="/dashboard" className="text-sm text-text-muted hover:text-text-secondary">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary">Connect</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-text-secondary">Twitter</a></li>
              <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-text-secondary">Discord</a></li>
              <li><a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-text-secondary">Telegram</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-surface-border pt-8 text-center">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
