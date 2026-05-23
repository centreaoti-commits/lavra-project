# 🧠 Crypto Therapist Agent — Master Implementation Plan

> **Goal:** Build an AI-powered trading psychology platform that analyzes on-chain wallet data to detect emotional trading patterns (FOMO, panic selling, revenge trading) and provides real-time coaching & intervention.

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

---

## 📋 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Phase 1: Frontend & UI/UX Design](#3-phase-1)
4. [Phase 2: Backend & API](#4-phase-2)
5. [Phase 3: Blockchain Data Layer](#5-phase-3)
6. [Phase 4: AI Behavioral Engine](#6-phase-4)
7. [Phase 5: Real-time Alert System](#7-phase-5)
8. [Phase 6: Integration & Testing](#8-phase-6)
9. [Phase 7: Deployment & DevOps](#9-phase-7)
10. [Phase 8: Monetization & Growth](#10-phase-8)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                     │
│                                                                │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌────────┐  │
│  │ Landing   │  │  Dashboard   │  │  Profile   │  │ Alerts │  │
│  │  Page     │  │  (Analytics) │  │  (Persona) │  │ Center │  │
│  └──────────┘  └──────────────┘  └────────────┘  └────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              WalletConnect / RainbowKit                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST API + WebSocket
┌──────────────────────────▼───────────────────────────────────┐
│                      BACKEND (FastAPI)                         │
│                                                                │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌────────┐  │
│  │ Auth &   │  │  Behavioral  │  │  Alert     │  │ Report │  │
│  │ Wallet   │  │  Engine      │  │  Service   │  │ Gen    │  │
│  │ Service  │  │  (Core AI)   │  │  (Realtime)│  │        │  │
│  └──────────┘  └──────────────┘  └────────────┘  └────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Task Queue (Celery + Redis)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    DATA & BLOCKCHAIN LAYER                     │
│                                                                │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌────────┐  │
│  │PostgreSQL│  │  TimescaleDB │  │  Alchemy/  │  │ Redis  │  │
│  │ (Users,  │  │  (Time-series│  │  QuickNode │  │ (Cache │  │
│  │  Trades) │  │   Analytics) │  │  (RPC)     │  │  Queue)│  │
│  └──────────┘  └──────────────┘  └────────────┘  └────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | SSR, fast, SEO |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid UI dev, consistent design |
| **Animation** | Framer Motion | Smooth transitions, premium feel |
| **Charts** | Recharts / TradingView Lightweight | Trading-grade charts |
| **Wallet** | RainbowKit + wagmi + viem | Best wallet connect UX |
| **Backend** | FastAPI (Python) | Async, fast, great for data work |
| **Database** | PostgreSQL + TimescaleDB | Relational + time-series optimized |
| **Cache/Queue** | Redis + Celery | Task queue for background jobs |
| **AI/ML** | GPT-4o + custom Python models | LLM for coaching, Python for pattern detection |
| **Blockchain** | Alchemy SDK + Etherscan API | Multi-chain tx data |
| **Real-time** | WebSocket (FastAPI native) | Live alerts |
| **Auth** | SIWE (Sign-In with Ethereum) | Web3-native auth |
| **Hosting** | Vercel (FE) + Railway/AWS (BE) | Scalable, easy deploy |
| **Monitoring** | Sentry + PostHog | Error tracking + analytics |

---

## 3. Phase 1: Frontend & UI/UX Design (Week 1-2)

### Design System

**Theme:** Dark, premium, glassmorphism
**Colors:**
- Background: `#0a0a0f` (deep dark)
- Card BG: `#12121a` with glass effect
- Primary: `#8b5cf6` (purple — trust, calm)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (amber)
- Danger: `#ef4444` (red — for emotional alerts)
- Accent: `#06b6d4` (cyan — for insights)

**Typography:**
- Headings: Inter (bold, tight tracking)
- Body: Inter (regular)
- Monospace: JetBrains Mono (numbers, data)

**Design Principles:**
- Premium dark theme (NEVER default/generic UI)
- Glassmorphism cards with subtle borders
- Gradient accents on key metrics
- Smooth animations on all state changes
- Data-dense but clean — trading terminal aesthetic
- Emoji indicators for quick emotional status

### Pages & Components

---

#### Page 1: Landing Page (`/`)

**Purpose:** Marketing page, explain concept, drive signups

**Layout:**
```
┌────────────────────────────────────────────┐
│  NAVBAR                                    │
│  [Logo]  Features  How It Works  [Connect] │
│                 Wallet                      │
├────────────────────────────────────────────┤
│                                            │
│  HERO SECTION                              │
│  "Your Wallet Reveals Your Psychology"     │
│  "Connect your wallet. We'll tell you      │
│   why you keep losing money."              │
│                                            │
│  [Connect Wallet → Start Analysis]         │
│                                            │
│  Animated preview: wallet scan → insight   │
├────────────────────────────────────────────┤
│                                            │
│  PROBLEM SECTION                           │
│  "90% of traders lose money.               │
│   Not because of bad analysis —            │
│   because of bad psychology."              │
│                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  FOMO   │ │  Panic  │ │ Revenge │      │
│  │  😰     │ │  😱     │ │  😤     │      │
│  │ Beli di │ │ Jual di │ │ Trade   │      │
│  │ atas    │ │ bawah   │ │ balas   │      │
│  └─────────┘ └─────────┘ └─────────┘      │
├────────────────────────────────────────────┤
│                                            │
│  HOW IT WORKS (3 steps)                    │
│  1. 🔗 Connect → 2. 🧠 Analyze → 3. 🛡️ Heal│
│                                            │
│  Step details with animated illustrations  │
├────────────────────────────────────────────┤
│                                            │
│  DEMO PREVIEW                              │
│  Mock dashboard showing:                   │
│  - FOMO Score: 72/100 🔴                  │
│  - Trading Personality: "Reactive Trader"  │
│  - Emotional Loss: $4,320 estimated        │
│  - Weekly improvement: +15%                │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│  FEATURES GRID                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Wallet   │ │ Real-time│ │ Daily    │   │
│  │ Analysis │ │ Alerts   │ │ Reports  │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Trading  │ │ Progress │ │ Multi-   │   │
│  │ Persona  │ │ Tracking │ │ Chain    │   │
│  └──────────┘ └──────────┘ └──────────┘   │
├────────────────────────────────────────────┤
│                                            │
│  PRICING                                   │
│  Free │ Pro $19/mo │ Premium $49/mo        │
│                                            │
├────────────────────────────────────────────┤
│  FOOTER                                    │
└────────────────────────────────────────────┘
```

**Components:**
- `Navbar` — Logo, nav links, Connect Wallet button (sticky, glass BG)
- `HeroSection` — Headline, subheadline, CTA, animated scan preview
- `ProblemSection` — 3 pain point cards with icons
- `HowItWorks` — 3-step flow with illustrations
- `DemoPreview` — Mock dashboard screenshot/animation
- `FeaturesGrid` — 6 feature cards with icons
- `PricingSection` — 3 tier cards
- `Footer` — Links, socials, legal

---

#### Page 2: Onboarding / First Scan (`/onboarding`)

**Purpose:** After wallet connect, show first analysis

**Layout:**
```
┌────────────────────────────────────────────┐
│                                            │
│  SCANNING ANIMATION                        │
│                                            │
│  "🔍 Scanning your wallet..."              │
│  "0xbe58...B06f"                           │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  ████████████████░░░░  72%        │    │
│  │                                    │    │
│  │  ✓ Fetching transactions...        │    │
│  │  ✓ Analyzing trade patterns...     │    │
│  │  ✓ Calculating emotional scores... │    │
│  │  ⟳ Generating personality profile..│    │
│  └────────────────────────────────────┘    │
│                                            │
│  Live stats appearing:                     │
│  "Found 847 transactions"                  │
│  "Analyzed 234 trades"                     │
│  "Detected 11 revenge trades"              │
│  "FOMO score: calculating..."              │
│                                            │
└────────────────────────────────────────────┘
```

Then transitions to results:

```
┌────────────────────────────────────────────┐
│                                            │
│  🧠 YOUR TRADING PSYCHOLOGY PROFILE        │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  TRADING PERSONALITY               │    │
│  │                                    │    │
│  │  "Reactive FOMO Trader"            │    │
│  │                                    │    │
│  │  You tend to buy after price       │    │
│  │  pumps and sell during dips.       │    │
│  │  72% of your buys happen after     │    │
│  │  +15% moves in 24h.                │    │
│  │                                    │    │
│  │  Estimated emotional loss: $4,320  │    │
│  └────────────────────────────────────┘    │
│                                            │
│  EMOTIONAL SCORES                          │
│  ┌─────────────────────────────────────┐   │
│  │ FOMO        ████████████░░  72 🔴   │   │
│  │ Panic Sell  ██████░░░░░░░░  45 🟡   │   │
│  │ Revenge     █████░░░░░░░░░  38 🟡   │   │
│  │ Overtrade   ████████░░░░░░  58 🟡   │   │
│  │ Diamond 💎  ██████████████  85 🟢   │   │
│  └─────────────────────────────────────┘   │
│                                            │
│  KEY INSIGHTS                              │
│  • "Kamu beli ETH di $3,847 (local top)    │
│    3 kali dalam sebulan terakhir"          │
│  • "Rata-rata hold time: 4.2 hari          │
│    (too short for conviction plays)"       │
│  • "Revenge trade pattern detected:        │
│    biasanya 20-45 menit setelah loss"      │
│                                            │
│  [Go to Dashboard →]                       │
│                                            │
└────────────────────────────────────────────┘
```

**Components:**
- `ScanAnimation` — Progress bar, live log, animated
- `PersonalityCard` — Main personality result
- `EmotionalScores` — Bar chart with color coding
- `KeyInsights` — Bullet list of top findings
- `CTAButton` — Navigate to dashboard

---

#### Page 3: Dashboard (`/dashboard`)

**Purpose:** Main hub — everything at a glance

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ NAVBAR  [Logo] [Dashboard] [History] [Alerts] [Profile]  │
│                                              [Avatar ⚙️]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─── TOP STATS BAR ──────────────────────────────────┐   │
│ │                                                     │   │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│ │ │ Today   │ │ FOMO    │ │ Trades  │ │ Streak  │   │   │
│ │ │ PnL     │ │ Score   │ │ Today   │ │ Days    │   │   │
│ │ │ +$240   │ │ 45/100  │ │ 3       │ │ 12 🔥   │   │   │
│ │ │ 🟢      │ │ 🟡      │ │         │ │         │   │   │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│ │                                                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌─── LEFT (8 col) ──────┐ ┌─── RIGHT (4 col) ───────┐   │
│ │                        │ │                          │   │
│ │ EMOTIONAL CHART        │ │ AI COACH CHAT            │   │
│ │ (Radar/Spider chart    │ │                          │   │
│ │  showing all 5 scores) │ │ 💬 "Hey! You've been    │   │
│ │                        │ │ calm today. 3 trades,   │   │
│ │ ─────────────────────  │ │ all planned. Keep it    │   │
│ │                        │ │ up!"                    │   │
│ │ TRADE TIMELINE         │ │                          │   │
│ │ (Visual timeline of    │ │ 💭 "What should I do   │   │
│ │  recent trades with    │ │ about my ETH position?" │   │
│ │  emotion indicators)   │ │                          │   │
│ │                        │ │ 💬 "Based on your       │   │
│ │ ─────────────────────  │ │ pattern, you usually    │   │
│ │                        │ │ sell ETH too early.     │   │
│ │ RECENT TRADES TABLE    │ │ Current hold: 2 days.   │   │
│ │ ┌─────┬──────┬──────┐ │ │ Avg profitable hold:    │   │
│ │ │Time │Pair  │PnL   │ │ │ 14 days. Consider      │   │
│ │ ├─────┼──────┼──────┤ │ │ holding longer."        │   │
│ │ │...  │...   │...   │ │ │                          │   │
│ │ └─────┴──────┴──────┘ │ │ [Type message...]       │   │
│ │                        │ │                          │   │
│ └────────────────────────┘ └──────────────────────────┘   │
│                                                          │
│ ┌─── WEEKLY PROGRESS ────────────────────────────────┐   │
│ │                                                     │   │
│ │  FOMO Score Trend (Line chart, last 30 days)        │   │
│ │  ───────────────────────────────                    │   │
│ │  85 ─                                              │   │
│ │  70 ─    ╲                                         │   │
│ │  55 ─     ╲──────╲                                 │   │
│ │  40 ─             ╲──────── ← Improving! 📉        │   │
│ │                                                     │   │
│ │  Achievement Badges:                                │   │
│ │  [7-day no revenge] [FOMO-free week] [First profit] │   │
│ │                                                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Components:**
- `TopStatsBar` — 4 key metric cards with sparklines
- `EmotionalRadar` — Spider/radar chart for 5 emotional scores
- `TradeTimeline` — Visual timeline with emotion badges
- `RecentTradesTable` — Sortable table with color-coded PnL
- `AICoachChat` — Side panel chat with AI coach
- `WeeklyProgress` — Line chart of score trends
- `AchievementBadges` — Gamification badges

---

#### Page 4: Trade History (`/history`)

**Purpose:** Deep dive into all analyzed trades

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  📊 TRADE HISTORY                                        │
│                                                          │
│  FILTERS                                                 │
│  [Chain: All ▼] [Token: All ▼] [Type: All ▼]            │
│  [Emotion: All ▼] [Date: Last 30d ▼] [PnL: All ▼]      │
│                                                          │
│  STATS SUMMARY                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Total   │ │ Win     │ │ Avg     │ │ Best    │       │
│  │ Trades  │ │ Rate    │ │ Hold    │ │ Trade   │       │
│  │ 234     │ │ 42%     │ │ 4.2d    │ │ +$1,200 │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                          │
│  TRADES                                                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │ May 20 │ ETH/USDC │ Buy $3,150 │ +$340 │ 🟢     │    │
│  │        │ 🧠 Pattern: Planned entry, good timing  │    │
│  │        │ ⏱️ Held: 8 days │ 🎯 Target hit          │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ May 18 │ PEPE     │ Buy $0.000012 │ -$180 │ 🔴  │    │
│  │        │ 🧠 Pattern: FOMO buy after +40% pump    │    │
│  │        │ ⏱️ Held: 6 hours │ 😱 Panic sold         │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ May 17 │ SOL      │ Buy $178 │ -$90 │ 🔴        │    │
│  │        │ 🧠 Pattern: Revenge trade (35min after  │    │
│  │        │ PEPE loss) │ 😤 Emotional decision       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  PAGINATION [< 1 2 3 ... 12 >]                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

#### Page 5: Alerts Center (`/alerts`)

**Purpose:** Manage and view all alerts

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  🔔 ALERTS CENTER                                        │
│                                                          │
│  ALERT PREFERENCES                                       │
│  ┌──────────────────────────────────────────────────┐    │
│  │ FOMO Detection     [ON]  Trigger: score > 60     │    │
│  │ Revenge Trade      [ON]  Trigger: within 1hr     │    │
│  │ Panic Sell         [ON]  Trigger: -10% in 1hr    │    │
│  │ Overtrading        [ON]  Trigger: >5 trades/day  │    │
│  │ Bag Holding        [ON]  Trigger: -80% unrealized│    │
│  │                                                    │    │
│  │ Delivery:  [✓] Telegram  [✓] Email  [ ] Push      │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  RECENT ALERTS                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 🔴 2 min ago                                    │    │
│  │ "REVENGE TRADE WARNING — You lost $180 on PEPE  │    │
│  │  35 minutes ago. You're now opening SOL.         │    │
│  │  Historical pattern: 80% of these trades lose.   │    │
│  │  Suggestion: Wait 24 hours."                     │    │
│  │                              [Dismiss] [Snooze]  │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ 🟡 3 hours ago                                   │    │
│  │ "FOMO ALERT — ETH is up 12% in 4 hours.         │    │
│  │  Your pattern: buy after +15% = usually lose.    │    │
│  │  Current price: $3,847. If you want to buy,      │    │
│  │  set limit at $3,650 (5% below current)."        │    │
│  │                              [Dismiss] [Snooze]  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

#### Page 6: Profile & Settings (`/profile`)

**Purpose:** User profile, wallet management, settings

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  👤 PROFILE & SETTINGS                                   │
│                                                          │
│  WALLET MANAGEMENT                                       │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Primary Wallet: 0xbe58...B06f  [✓ Connected]    │    │
│  │ + Add Wallet (up to 5 on Pro plan)               │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  TRADING RULES (Self-imposed guardrails)                 │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Max trades per day:    [3]                        │    │
│  │ Max position size:     [$500]                     │    │
│  │ Cooldown after loss:   [4 hours]                  │    │
│  │ No trading hours:      [11PM - 7AM]              │    │
│  │                                                    │    │
│  │ [✓] Block my trades when rules violated           │    │
│  │     (Premium only — adds friction layer)          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  NOTIFICATION SETTINGS                                   │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Telegram Bot:     [@CryptoTherapist_bot] ✓       │    │
│  │ Email:            [user@email.com] ✓             │    │
│  │ Alert Frequency:  [Real-time ▼]                  │    │
│  │ Quiet Hours:      [11PM - 7AM]                   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  SUBSCRIPTION                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Current Plan: Pro ($19/mo)                       │    │
│  │ Next billing: June 22, 2026                      │    │
│  │ [Manage Subscription]                            │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Phase 2: Backend & API (Week 2-3)

### API Endpoints

```
Authentication
  POST   /api/auth/connect          → Wallet signature verification (SIWE)
  POST   /api/auth/refresh          → Refresh JWT token
  DELETE /api/auth/disconnect       → Logout

User
  GET    /api/user/profile          → User profile & settings
  PUT    /api/user/settings         → Update settings
  POST   /api/user/wallet           → Add wallet
  DELETE /api/user/wallet/{address} → Remove wallet

Analysis
  POST   /api/analysis/scan/{wallet}    → Trigger full wallet scan
  GET    /api/analysis/profile          → Get personality profile
  GET    /api/analysis/scores           → Get emotional scores
  GET    /api/analysis/insights         → Get AI-generated insights
  GET    /api/analysis/trends           → Score trends over time

Trades
  GET    /api/trades                    → List trades (paginated, filtered)
  GET    /api/trades/{id}              → Trade detail with emotion analysis
  GET    /api/trades/stats             → Aggregate trade statistics
  GET    /api/trades/patterns          → Detected behavioral patterns

Alerts
  GET    /api/alerts                    → List alerts
  PUT    /api/alerts/{id}/read         → Mark as read
  PUT    /api/alerts/settings          → Update alert preferences
  POST   /api/alerts/test              → Send test alert

Chat
  POST   /api/chat/message             → Send message to AI coach
  GET    /api/chat/history             → Chat history

Reports
  GET    /api/reports/daily             → Daily report
  GET    /api/reports/weekly            → Weekly report
  GET    /api/reports/monthly           → Monthly report
```

### Database Schema

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    plan VARCHAR(20) DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    telegram_chat_id VARCHAR(50),
    email VARCHAR(255),
    settings JSONB DEFAULT '{}'
);

-- Wallets
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(42) NOT NULL,
    chain VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, address, chain)
);

-- Transactions (raw on-chain data)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    tx_hash VARCHAR(66) NOT NULL,
    chain VARCHAR(20) NOT NULL,
    block_number BIGINT,
    timestamp TIMESTAMPTZ NOT NULL,
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    value_usd DECIMAL(20, 4),
    gas_used BIGINT,
    gas_price_gwei DECIMAL(20, 8),
    method VARCHAR(50),
    raw_data JSONB,
    UNIQUE(tx_hash, chain)
);

-- Trades (analyzed transactions)
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    tx_hash VARCHAR(66),
    chain VARCHAR(20),
    timestamp TIMESTAMPTZ NOT NULL,
    pair VARCHAR(50),          -- e.g., "ETH/USDC"
    side VARCHAR(10),          -- buy/sell
    token_in VARCHAR(20),
    token_out VARCHAR(20),
    amount_in DECIMAL(30, 10),
    amount_out DECIMAL(30, 10),
    value_usd DECIMAL(20, 4),
    price_at_entry DECIMAL(20, 8),
    price_at_exit DECIMAL(20, 8),
    pnl_usd DECIMAL(20, 4),
    pnl_percent DECIMAL(10, 4),
    hold_duration INTERVAL,
    emotion_tag VARCHAR(30),   -- fomo, panic_sell, revenge, planned, etc
    emotion_confidence DECIMAL(5, 4),
    context JSONB              -- additional analysis metadata
);

-- Emotional Scores (time-series)
CREATE TABLE emotional_scores (
    time TIMESTAMPTZ NOT NULL,
    wallet_id UUID NOT NULL,
    fomo_score INTEGER CHECK (fomo_score BETWEEN 0 AND 100),
    panic_score INTEGER CHECK (panic_score BETWEEN 0 AND 100),
    revenge_score INTEGER CHECK (revenge_score BETWEEN 0 AND 100),
    overtrade_score INTEGER CHECK (overtrade_score BETWEEN 0 AND 100),
    diamond_hands_score INTEGER CHECK (diamond_hands_score BETWEEN 0 AND 100),
    overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100)
);
-- Convert to TimescaleDB hypertable for time-series optimization

-- Personality Profiles
CREATE TABLE personality_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    archetype VARCHAR(50),     -- "Reactive FOMO Trader", etc
    description TEXT,
    strengths JSONB,
    weaknesses JSONB,
    estimated_emotional_loss DECIMAL(20, 4),
    trade_count_analyzed INTEGER,
    analysis_period_start TIMESTAMPTZ,
    analysis_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(30),    -- fomo, revenge, panic, overtrade, baghold
    severity VARCHAR(10),      -- info, warning, critical
    title VARCHAR(255),
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(10),          -- user, assistant
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50),
    badge_name VARCHAR(100),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Indexes
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_transactions_wallet_time ON transactions(wallet_id, timestamp DESC);
CREATE INDEX idx_trades_wallet_time ON trades(wallet_id, timestamp DESC);
CREATE INDEX idx_trades_emotion ON trades(emotion_tag);
CREATE INDEX idx_alerts_user_time ON alerts(user_id, created_at DESC);
CREATE INDEX idx_chat_user_time ON chat_messages(user_id, created_at DESC);
```

---

## 5. Phase 3: Blockchain Data Layer (Week 3-4)

### Transaction Fetching Pipeline

```
1. User connects wallet
2. Fetch ALL transactions from Alchemy/Moralis API
   - EVM chains: ETH, BSC, Polygon, Arbitrum, Base, Optimism, Avalanche
   - For each chain: getTransactions, getTokenTransfers, getInternalTxs
3. Parse & normalize into unified format
4. Identify DEX trades (Uniswap, Sushi, PancakeSwap, 1inch, etc)
5. Match buy/sell pairs (token_in → token_out with USD values)
6. Store in transactions + trades tables
7. Calculate derived metrics (PnL, hold time, etc)
8. Run emotional analysis on each trade
9. Generate aggregate scores
```

### Multi-Chain Support

| Chain | RPC Provider | DEX Protocols |
|---|---|---|
| Ethereum | Alchemy | Uniswap, Sushi, Curve, 1inch |
| BSC | Alchemy | PancakeSwap, BiSwap |
| Polygon | Alchemy | QuickSwap, Sushi |
| Arbitrum | Alchemy | Uniswap, Camelot, GMX |
| Base | Alchemy | Uniswap, Aerodrome |
| Optimism | Alchemy | Uniswap, Velodrome |
| Avalanche | Moralis | TraderJoe, Pangolin |
| Solana | Helius | Jupiter, Raydium, Orca |

---

## 6. Phase 4: AI Behavioral Engine (Week 4-5)

### Emotion Detection Algorithms

**FOMO Score (0-100):**
```
Inputs:
  - Price change in 24h before trade (>15% = high FOMO risk)
  - Volume spike in token (>3x average = mania signal)
  - Social buzz (Twitter mentions, if available)
  - Time between "awareness" and "buy" (very short = impulse)
  - Position size relative to portfolio (>20% = conviction bet)
  
Formula (weighted):
  fomo = (price_change_signal * 0.35) +
         (volume_spike_signal * 0.20) +
         (timing_signal * 0.25) +
         (size_signal * 0.20)
```

**Panic Sell Score (0-100):**
```
Inputs:
  - Price drop magnitude before sell
  - Speed of decision (time from drop to sell)
  - Sell price vs buy price (selling at loss)
  - Market-wide sentiment (if market also dumping)
  - Did they sell everything or partial?

Signals:
  - Sold >50% position within 2 hours of -10% drop = panic
  - Sold at significant loss after holding < 24h = panic
  - Multiple sells in rapid succession during crash = panic cascade
```

**Revenge Trade Score (0-100):**
```
Inputs:
  - Time since last loss (shorter = more likely revenge)
  - New trade size vs last loss (bigger = revenge amplification)
  - Token type change (switching to different token = emotional)
  - Pattern frequency (repeated = habitual)

Detection:
  IF (last_trade.pnl < 0) AND
     (time_since_last_trade < 2 hours) AND
     (new_trade.size > last_trade.size * 1.5)
  THEN revenge_score = HIGH
```

**Overtrade Score (0-100):**
```
Inputs:
  - Number of trades per day/week
  - Average optimal frequency (personality-adjusted)
  - Trade quality degradation over session
  - Gas spending relative to PnL

Thresholds:
  - <3 trades/day = healthy
  - 3-7 trades/day = elevated
  - >7 trades/day = overtrading
  - Quality declining with count = strong signal
```

**Diamond Hands Score (0-100):**
```
Inputs:
  - Average hold time vs market average
  - Holding through dips (>20% drawdown and still holding)
  - Taking profit at reasonable levels (not too early, not too late)
  - Not panic selling during market crashes

High score = good at holding conviction plays
Low score = sells too early, can't handle volatility
```

### Personality Archetypes

| Archetype | Key Traits | Coaching Focus |
|---|---|---|
| 🏃 Reactive FOMO Trader | Buys pumps, high FOMO score | Patience, limit orders |
| 😱 Panic Seller | Sells dips, low conviction | Position sizing, thesis |
| 😤 Revenge Trader | Trades to recover losses | Cooling off, journaling |
| 🎰 Gambler | Overtrades, no strategy | Strategy, discipline |
| 💎 Diamond Hands | Strong hold, might take profit too late | Exit strategy |
| 🧊 Cold Calculator | Low emotion, systematic | Already good, minor tweaks |
| 🦋 Butterfly | Jumps between tokens constantly | Focus, conviction |
| 🐢 Slow & Steady | Few trades, careful entries | Confidence, scaling |

### AI Coaching Engine (LLM Integration)

```python
# System prompt for AI coach
COACH_SYSTEM_PROMPT = """
You are a crypto trading psychologist. You analyze the user's on-chain
behavior data and help them improve their trading psychology.

Personality Profile: {archetype}
Emotional Scores: FOMO={fomo}, Panic={panic}, Revenge={revenge}, Overtrade={overtrade}
Recent Trades: {recent_trades_summary}
Key Weaknesses: {weaknesses}
Key Strengths: {strengths}
Estimated Emotional Loss: ${emotional_loss}

Rules:
- Be direct but empathetic
- Reference SPECIFIC trades from their history
- Give actionable advice, not generic platitudes
- Use their data to make points (numbers, dates, patterns)
- Suggest concrete next steps
- Be supportive when they show improvement
- Challenge them when they're making excuses
- Use their language style (match formality)
"""
```

---

## 7. Phase 5: Real-time Alert System (Week 5-6)

### Alert Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Blockchain  │────▶│  WebSocket   │────▶│  Pattern     │
│  Event       │     │  Listener    │     │  Detector    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                           ┌──────▼───────┐
                                           │  Alert       │
                                           │  Generator   │
                                           └──────┬───────┘
                                                  │
                              ┌────────────────────┼────────────────┐
                              │                    │                │
                       ┌──────▼───────┐   ┌───────▼──────┐  ┌─────▼──────┐
                       │  Telegram    │   │  WebSocket   │  │  Email     │
                       │  Bot         │   │  Push (Web)  │  │  (SendGrid)│
                       └──────────────┘   └──────────────┘  └────────────┘
```

### Alert Types

| Type | Trigger | Severity | Message Template |
|---|---|---|---|
| FOMO | Token pumping + user about to buy | ⚠️ Warning | "ETH +12% in 4h. Your pattern: buy after pumps = usually lose. Wait or set limit at {price}." |
| Revenge | Loss < 2h ago + new trade | 🔴 Critical | "You lost ${loss} {time} ago. This trade matches revenge pattern. 80% of these lose." |
| Panic | Large price drop + user selling | ⚠️ Warning | "Market dropping. Your panic sell history: sold at bottom 4/5 times. Consider holding." |
| Overtrade | >N trades today | 🟡 Info | "You've made {count} trades today (limit: {limit}). Quality declining." |
| Achievement | Milestone reached | 🟢 Positive | "🔥 7-day FOMO-free streak! You're improving." |

---

## 8. Phase 6: Integration & Testing (Week 6-7)

### Testing Strategy

**Unit Tests:**
- All emotion scoring functions
- Trade classification algorithms
- API endpoint handlers
- Database queries

**Integration Tests:**
- Full scan pipeline (wallet → analysis → profile)
- Alert trigger → delivery flow
- Authentication flow (SIWE)
- Multi-chain data aggregation

**E2E Tests:**
- Complete user journey (connect → scan → profile → dashboard)
- Alert delivery to Telegram
- Chat with AI coach
- Subscription upgrade flow

---

## 9. Phase 7: Deployment & DevOps (Week 7-8)

### Infrastructure

```
Production Stack:
├── Frontend: Vercel (auto-deploy from main)
├── Backend: Railway or AWS ECS
│   ├── FastAPI app (2 instances, auto-scale)
│   ├── Celery workers (2 instances)
│   └── Celery beat (scheduler)
├── Database: Supabase (PostgreSQL) or AWS RDS
├── Cache: Upstash Redis (serverless)
├── Blockchain RPC: Alchemy (growth plan)
├── Email: SendGrid
├── Telegram: Official Bot API
├── Monitoring: Sentry + PostHog
└── CDN: Cloudflare
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Blockchain
ALCHEMY_API_KEY=...
ETHERSCAN_API_KEY=...
MORALIS_API_KEY=...

# AI
OPENAI_API_KEY=...

# Auth
JWT_SECRET=...
SIWE_DOMAIN=cryptotherapist.ai

# Payments
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Notifications
TELEGRAM_BOT_TOKEN=...
SENDGRID_API_KEY=...

# Monitoring
SENTRY_DSN=...
POSTHOG_KEY=...
```

---

## 10. Phase 8: Monetization & Growth (Week 8+)

### Pricing Tiers

| Feature | Free | Pro ($19/mo) | Premium ($49/mo) |
|---|---|---|---|
| Wallets | 1 | 5 | Unlimited |
| Historical Analysis | 30 days | 12 months | All time |
| Emotional Scores | Basic | Full + trends | Full + AI coaching |
| Alerts | 5/month | Unlimited | Unlimited + custom rules |
| AI Chat | 3 messages/day | Unlimited | Unlimited + proactive |
| Reports | Weekly | Daily | Daily + custom |
| Trading Guardrails | ❌ | Basic | Full (block trades) |
| Multi-chain | ETH only | All EVM | All chains |
| Achievement System | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

### Growth Strategy

**Phase 1 — Launch (Month 1-2):**
- Waitlist via landing page
- Beta access to 100 users (free Pro for feedback)
- Twitter/X presence: daily trading psychology tips
- Telegram community

**Phase 2 — Traction (Month 3-4):**
- Public launch
- Content marketing (blog, Twitter threads)
- Influencer partnerships (crypto Twitter KOLs)
- Referral program (give Pro, get Pro)

**Phase 3 — Scale (Month 5-6):**
- Mobile app (React Native or PWA)
- API access for developers
- B2B: White-label for exchanges/trading platforms
- Integration with portfolio trackers

---

## Task Breakdown Summary

| Phase | Duration | Tasks |
|---|---|---|
| 1. Frontend & UI/UX | Week 1-2 | Landing, Onboarding, Dashboard, History, Alerts, Profile |
| 2. Backend & API | Week 2-3 | FastAPI setup, all endpoints, DB schema, auth |
| 3. Blockchain Data | Week 3-4 | Multi-chain fetch, trade parsing, DEX detection |
| 4. AI Engine | Week 4-5 | Emotion scoring, personality archetypes, LLM coach |
| 5. Alerts | Week 5-6 | Real-time pipeline, Telegram bot, email |
| 6. Testing | Week 6-7 | Unit, integration, E2E tests |
| 7. Deployment | Week 7-8 | Infrastructure, CI/CD, monitoring |
| 8. Growth | Week 8+ | Monetization, marketing, mobile |
