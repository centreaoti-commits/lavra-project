# 🎨 Frontend Implementation Plan — Crypto Therapist Agent

> Detailed file structure, components, and code architecture for the Next.js frontend.

---

## Project Structure

```
crypto-therapist-frontend/
├── public/
│   ├── fonts/
│   │   ├── Inter-Variable.woff2
│   │   └── JetBrainsMono-Variable.woff2
│   ├── images/
│   │   ├── logo.svg
│   │   ├── og-image.png
│   │   └── illustrations/
│   │       ├── scan-animation.json      # Lottie animation
│   │       ├── brain-scan.json
│   │       └── shield-protect.json
│   └── favicon.ico
│
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout (fonts, providers, theme)
│   │   ├── page.tsx                      # Landing page
│   │   ├── globals.css                   # Tailwind + custom CSS
│   │   │
│   │   ├── onboarding/
│   │   │   └── page.tsx                  # First scan flow
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # Dashboard layout (sidebar + topbar)
│   │   │   ├── page.tsx                  # Main dashboard
│   │   │   ├── history/
│   │   │   │   └── page.tsx              # Trade history
│   │   │   ├── alerts/
│   │   │   │   └── page.tsx              # Alerts center
│   │   │   ├── profile/
│   │   │   │   └── page.tsx              # Profile & settings
│   │   │   └── reports/
│   │   │       └── page.tsx              # Reports
│   │   │
│   │   └── api/                          # Next.js API routes (if needed)
│   │       └── auth/
│   │           └── [...nextauth]/
│   │
│   ├── components/
│   │   ├── ui/                           # Base UI components (shadcn-style)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx                  # Glass card component
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── separator.tsx
│   │   │   └── scroll-area.tsx
│   │   │
│   │   ├── layout/                       # Layout components
│   │   │   ├── navbar.tsx                # Landing navbar
│   │   │   ├── sidebar.tsx               # Dashboard sidebar
│   │   │   ├── topbar.tsx                # Dashboard top bar
│   │   │   ├── mobile-nav.tsx            # Mobile navigation
│   │   │   └── footer.tsx
│   │   │
│   │   ├── landing/                      # Landing page sections
│   │   │   ├── hero-section.tsx
│   │   │   ├── problem-section.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── demo-preview.tsx
│   │   │   ├── features-grid.tsx
│   │   │   ├── pricing-section.tsx
│   │   │   └── cta-section.tsx
│   │   │
│   │   ├── onboarding/                   # Onboarding flow
│   │   │   ├── scan-progress.tsx         # Scanning animation
│   │   │   ├── personality-card.tsx      # Trading personality result
│   │   │   ├── emotional-scores.tsx      # Score bars
│   │   │   └── key-insights.tsx          # AI insights list
│   │   │
│   │   ├── dashboard/                    # Dashboard components
│   │   │   ├── stats-bar.tsx             # Top 4 metric cards
│   │   │   ├── emotional-radar.tsx       # Radar/spider chart
│   │   │   ├── trade-timeline.tsx        # Visual trade timeline
│   │   │   ├── trades-table.tsx          # Recent trades table
│   │   │   ├── ai-coach-chat.tsx         # Side panel chat
│   │   │   ├── weekly-progress.tsx       # Trend line chart
│   │   │   ├── achievement-badges.tsx    # Gamification badges
│   │   │   └── streak-counter.tsx        # Current streak display
│   │   │
│   │   ├── history/                      # Trade history components
│   │   │   ├── filters-bar.tsx           # Chain/token/emotion filters
│   │   │   ├── stats-summary.tsx         # Aggregate stats
│   │   │   ├── trade-card.tsx            # Individual trade card
│   │   │   └── pagination.tsx
│   │   │
│   │   ├── alerts/                       # Alert components
│   │   │   ├── alert-card.tsx            # Individual alert
│   │   │   ├── alert-settings.tsx        # Alert preferences
│   │   │   └── alert-stats.tsx           # Alert summary
│   │   │
│   │   ├── profile/                      # Profile components
│   │   │   ├── wallet-manager.tsx        # Wallet list + add
│   │   │   ├── trading-rules.tsx         # Self-imposed guardrails
│   │   │   ├── notification-settings.tsx
│   │   │   └── subscription-card.tsx
│   │   │
│   │   ├── shared/                       # Shared components
│   │   │   ├── wallet-connect-button.tsx # RainbowKit styled button
│   │   │   ├── score-gauge.tsx           # Circular score indicator
│   │   │   ├── emotion-badge.tsx         # Color-coded emotion tag
│   │   │   ├── pnl-display.tsx           # Profit/Loss with color
│   │   │   ├── address-display.tsx       # Truncated address with copy
│   │   │   ├── chain-icon.tsx            # Chain logo component
│   │   │   ├── loading-scan.tsx          # Scan loading animation
│   │   │   ├── glass-card.tsx            # Reusable glass card
│   │   │   └── gradient-text.tsx         # Gradient text effect
│   │   │
│   │   └── providers/                    # Context providers
│   │       ├── web3-provider.tsx         # RainbowKit + wagmi setup
│   │       ├── theme-provider.tsx        # Dark theme
│   │       ├── query-provider.tsx        # TanStack Query
│   │       └── notification-provider.tsx # Toast notifications
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── use-analysis.ts              # Fetch analysis data
│   │   ├── use-trades.ts                # Fetch & manage trades
│   │   ├── use-alerts.ts                # Fetch & manage alerts
│   │   ├── use-chat.ts                  # AI coach chat
│   │   ├── use-scores.ts                # Emotional scores
│   │   ├── use-profile.ts               # User profile
│   │   ├── use-wallet-scan.ts           # Trigger wallet scan
│   │   └── use-websocket.ts             # Real-time updates
│   │
│   ├── lib/                              # Utilities
│   │   ├── api.ts                        # API client (fetch wrapper)
│   │   ├── constants.ts                  # App constants
│   │   ├── utils.ts                      # General utilities
│   │   ├── format.ts                     # Number/address formatters
│   │   ├── chains.ts                     # Chain configurations
│   │   ├── wagmi.ts                      # wagmi config
│   │   └── validations.ts               # Zod schemas
│   │
│   ├── types/                            # TypeScript types
│   │   ├── user.ts
│   │   ├── trade.ts
│   │   ├── analysis.ts
│   │   ├── alert.ts
│   │   └── chat.ts
│   │
│   └── styles/                           # Additional styles
│       ├── animations.css                # Custom animations
│       └── chart-themes.ts               # Recharts theme config
│
├── .env.local                            # Environment variables
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Key Component Details

### 1. Root Layout (`app/layout.tsx`)

```tsx
// Providers stack:
// 1. ThemeProvider (dark mode forced)
// 2. Web3Provider (RainbowKit + wagmi)
// 3. QueryProvider (TanStack Query)
// 4. NotificationProvider (Toasts)

// Fonts: Inter (body) + JetBrains Mono (numbers)
// Global: Dark background, smooth scrolling, custom scrollbar
```

### 2. Glass Card Component (`components/shared/glass-card.tsx`)

```tsx
// Reusable premium card with:
// - Background: rgba(18, 18, 26, 0.8)
// - Backdrop-blur: 12px
// - Border: 1px solid rgba(255, 255, 255, 0.06)
// - Border-radius: 16px
// - Hover: subtle border glow
// - Optional gradient border on hover
```

### 3. Score Gauge Component (`components/shared/score-gauge.tsx`)

```tsx
// Circular progress indicator
// Color ranges:
//   0-30: Green (#10b981) — Healthy
//   31-60: Yellow (#f59e0b) — Watch out
//   61-80: Orange (#f97316) — Concerning
//   81-100: Red (#ef4444) — Critical
// Animated fill on mount
// Label inside: score number
```

### 4. Emotional Radar Chart (`components/dashboard/emotional-radar.tsx`)

```tsx
// Recharts RadarChart with 5 axes:
// - FOMO
// - Panic Sell
// - Revenge
// - Overtrade
// - Diamond Hands
// Fill: gradient purple with opacity
// Stroke: primary color
// Labels at each axis point
// Animated on data load
```

### 5. AI Coach Chat (`components/dashboard/ai-coach-chat.tsx`)

```tsx
// Features:
// - Fixed height scrollable container
// - Message bubbles (user = right, AI = left)
// - Typing indicator animation
// - Auto-scroll to latest message
// - "Quick actions" buttons:
//   "Why did I lose money this week?"
//   "What's my biggest weakness?"
//   "Give me a trading rule suggestion"
// - Reference specific trades in responses
// - Copy message button
```

### 6. Trade Card (`components/history/trade-card.tsx`)

```tsx
// Expandable card showing:
// - Header: Time, Pair, Chain icon, PnL (colored)
// - Emotion badge (FOMO/Panic/Revenge/Planned)
// - Expandable details:
//   - Entry/exit prices
//   - Hold duration
//   - AI analysis of this specific trade
//   - "What you could have done differently"
// - Related trades (same token, similar pattern)
```

### 7. Scan Progress Animation (`components/onboarding/scan-progress.tsx`)

```tsx
// Lottie animation + progress bar
// Steps:
// 1. "Connecting to blockchain..." (0-15%)
// 2. "Fetching transactions... (found: N)" (15-40%)
// 3. "Analyzing trade patterns..." (40-60%)
// 4. "Calculating emotional scores..." (60-80%)
// 5. "Generating your personality profile..." (80-100%)
// Each step has animated checkmark on completion
// Live counter of transactions found
// Estimated time remaining
```

### 8. Landing Hero Section (`components/landing/hero-section.tsx`)

```tsx
// Layout:
// - Large headline with gradient text
// - Subtitle in muted color
// - Animated illustration (wallet → brain → shield)
// - CTA button: "Connect Wallet — Free Analysis"
// - Trust indicators: "2,847 wallets analyzed" counter
// - Background: subtle grid pattern + floating particles
```

---

## Color Palette (Tailwind Config)

```typescript
// tailwind.config.ts
colors: {
  background: '#0a0a0f',
  surface: {
    DEFAULT: '#12121a',
    hover: '#1a1a2e',
    active: '#22223a',
  },
  primary: {
    DEFAULT: '#8b5cf6',
    hover: '#7c3aed',
    muted: 'rgba(139, 92, 246, 0.15)',
  },
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  accent: '#06b6d4',
  muted: '#64748b',
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#475569',
  },
}
```

---

## Animation Specifications

```css
/* Page transitions */
.page-enter { opacity: 0; transform: translateY(20px); }
.page-enter-active { opacity: 1; transform: translateY(0); transition: 0.3s ease-out; }

/* Card hover */
.card-hover { transition: all 0.2s ease; }
.card-hover:hover { border-color: rgba(139, 92, 246, 0.3); transform: translateY(-2px); }

/* Score bar fill */
@keyframes scoreFill {
  from { width: 0%; }
  to { width: var(--score); }
}

/* Pulse for live alerts */
@keyframes alertPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
}

/* Typing indicator */
@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

/* Scan progress shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## Responsive Breakpoints

| Breakpoint | Layout Changes |
|---|---|
| Mobile (< 640px) | Single column, bottom nav, stacked cards |
| Tablet (640-1024px) | 2-column dashboard, collapsible sidebar |
| Desktop (> 1024px) | Full 3-column dashboard, side chat panel |
| Wide (> 1440px) | Wider cards, more data density |

---

## Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@rainbow-me/rainbowkit": "^2.1.0",
    "wagmi": "^2.12.0",
    "viem": "^2.16.0",
    "@tanstack/react-query": "^5.50.0",
    "recharts": "^2.12.0",
    "framer-motion": "^11.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "class-variance-authority": "^0.7.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.400.0",
    "date-fns": "^3.6.0",
    "lottie-react": "^2.4.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0"
  }
}
```

---

## Implementation Order

### Week 1: Foundation
1. Project setup (Next.js + Tailwind + TypeScript)
2. Design system (colors, typography, glass card, buttons)
3. Layout components (navbar, sidebar, topbar, footer)
4. Web3 provider setup (RainbowKit + wagmi)
5. Landing page (all sections)

### Week 2: Dashboard & Core
6. Onboarding flow (scan animation + results)
7. Dashboard layout + stats bar
8. Emotional radar chart
9. Trade timeline + trades table
10. AI coach chat panel
11. Trade history page with filters
12. Alerts center
13. Profile & settings page
14. Responsive design pass
15. Animation polish
