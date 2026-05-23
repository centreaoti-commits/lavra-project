# ⚙️ Backend & AI Engine Implementation Plan — Crypto Therapist Agent

> Detailed backend architecture, API implementation, blockchain data pipeline, and AI behavioral engine.

---

## Project Structure

```
crypto-therapist-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                         # FastAPI app entry point
│   ├── config.py                       # Settings & env vars
│   ├── dependencies.py                 # Shared dependencies (auth, db)
│   │
│   ├── api/                            # API route handlers
│   │   ├── __init__.py
│   │   ├── router.py                   # Main router aggregator
│   │   │
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py              # Auth endpoints
│   │   │   └── siwe.py                # Sign-In with Ethereum verification
│   │   │
│   │   ├── user/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py              # User profile & settings
│   │   │   └── schemas.py             # Pydantic models
│   │   │
│   │   ├── analysis/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py              # Analysis endpoints
│   │   │   └── schemas.py
│   │   │
│   │   ├── trades/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py              # Trade history endpoints
│   │   │   └── schemas.py
│   │   │
│   │   ├── alerts/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py              # Alert endpoints
│   │   │   └── schemas.py
│   │   │
│   │   ├── chat/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py              # AI coach chat
│   │   │   └── schemas.py
│   │   │
│   │   └── reports/
│   │       ├── __init__.py
│   │       ├── routes.py              # Report generation
│   │       └── schemas.py
│   │
│   ├── core/                           # Core business logic
│   │   ├── __init__.py
│   │   │
│   │   ├── blockchain/                 # Blockchain data layer
│   │   │   ├── __init__.py
│   │   │   ├── fetcher.py             # Multi-chain tx fetcher
│   │   │   ├── parser.py              # Transaction parser
│   │   │   ├── dex_detector.py        # DEX trade identification
│   │   │   ├── price_service.py       # Token price lookups
│   │   │   └── chains.py              # Chain configurations
│   │   │
│   │   ├── analysis/                   # Behavioral analysis engine
│   │   │   ├── __init__.py
│   │   │   ├── trade_classifier.py    # Classify trades by emotion
│   │   │   ├── fomo_detector.py       # FOMO scoring algorithm
│   │   │   ├── panic_detector.py      # Panic sell detection
│   │   │   ├── revenge_detector.py    # Revenge trade detection
│   │   │   ├── overtrade_detector.py  # Overtrading detection
│   │   │   ├── diamond_hands.py       # Diamond hands scoring
│   │   │   ├── pattern_engine.py      # Pattern recognition
│   │   │   ├── personality.py         # Archetype assignment
│   │   │   └── scoring.py             # Aggregate score calculation
│   │   │
│   │   ├── ai/                         # AI/LLM integration
│   │   │   ├── __init__.py
│   │   │   ├── coach.py               # AI trading coach
│   │   │   ├── insight_generator.py   # Generate insights from data
│   │   │   ├── report_generator.py    # Daily/weekly report generation
│   │   │   └── prompts.py             # LLM prompt templates
│   │   │
│   │   └── alerts/                     # Alert system
│   │       ├── __init__.py
│   │       ├── detector.py            # Real-time pattern detector
│   │       ├── generator.py           # Alert message generator
│   │       ├── dispatcher.py          # Multi-channel alert sender
│   │       └── channels/
│   │           ├── __init__.py
│   │           ├── telegram.py        # Telegram bot alerts
│   │           ├── email.py           # Email alerts (SendGrid)
│   │           └── websocket.py       # WebSocket push
│   │
│   ├── models/                         # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py                    # Base model
│   │   ├── user.py                    # User model
│   │   ├── wallet.py                  # Wallet model
│   │   ├── transaction.py             # Raw transaction
│   │   ├── trade.py                   # Analyzed trade
│   │   ├── emotional_score.py         # Time-series scores
│   │   ├── personality_profile.py     # Personality profile
│   │   ├── alert.py                   # Alert model
│   │   ├── chat_message.py            # Chat message
│   │   └── achievement.py             # Achievement/badge
│   │
│   ├── schemas/                        # Shared Pydantic schemas
│   │   ├── __init__.py
│   │   ├── common.py                  # Pagination, responses
│   │   └── wallet.py                  # Wallet-related schemas
│   │
│   ├── services/                       # Service layer
│   │   ├── __init__.py
│   │   ├── auth_service.py            # JWT + SIWE auth
│   │   ├── user_service.py            # User CRUD
│   │   ├── scan_service.py            # Orchestrates full wallet scan
│   │   ├── analysis_service.py        # Orchestrates behavioral analysis
│   │   └── subscription_service.py    # Stripe integration
│   │
│   ├── tasks/                          # Celery background tasks
│   │   ├── __init__.py
│   │   ├── celery_app.py              # Celery configuration
│   │   ├── scan_tasks.py              # Background wallet scanning
│   │   ├── analysis_tasks.py          # Background analysis
│   │   ├── alert_tasks.py             # Background alert checking
│   │   └── report_tasks.py            # Scheduled report generation
│   │
│   └── utils/                          # Utility functions
│       ├── __init__.py
│       ├── jwt.py                     # JWT token helpers
│       ├── crypto.py                  # Address validation, hashing
│       ├── math.py                    # Decimal math, percentage calc
│       └── time.py                    # Timezone, duration helpers
│
├── alembic/                            # Database migrations
│   ├── env.py
│   ├── versions/
│   └── alembic.ini
│
├── tests/                              # Test suite
│   ├── conftest.py                    # Fixtures
│   ├── test_api/
│   │   ├── test_auth.py
│   │   ├── test_analysis.py
│   │   ├── test_trades.py
│   │   └── test_alerts.py
│   ├── test_core/
│   │   ├── test_fomo_detector.py
│   │   ├── test_panic_detector.py
│   │   ├── test_revenge_detector.py
│   │   ├── test_personality.py
│   │   └── test_dex_detector.py
│   └── test_services/
│       ├── test_scan_service.py
│       └── test_analysis_service.py
│
├── docker-compose.yml                  # Local dev stack
├── Dockerfile
├── requirements.txt
├── pyproject.toml
├── .env.example
└── README.md
```

---

## Core Algorithm Details

### FOMO Detector (`core/analysis/fomo_detector.py`)

```python
class FOMODetector:
    """
    Detects FOMO (Fear Of Missing Out) in trading behavior.
    
    A trade is classified as FOMO when:
    1. The token pumped significantly before the buy
    2. The user bought near a local top
    3. Position size was larger than usual (conviction bet)
    4. Short time between awareness and execution
    """

    def calculate_fomo_score(self, trade: Trade, context: TradeContext) -> float:
        """
        Returns score 0-100 where 100 = definite FOMO.
        
        Signals:
        - price_change_24h: How much price moved before trade
        - distance_from_local_high: How close to recent top
        - volume_spike: Unusual volume (mania signal)
        - position_size_ratio: Size vs user's average
        - time_since_price_move: How quickly they reacted
        """
        
        signals = []
        
        # Signal 1: Price already pumped (weight: 35%)
        if context.price_change_24h > 30:
            signals.append(('price_pump', 100, 0.35))
        elif context.price_change_24h > 15:
            signals.append(('price_pump', 70, 0.35))
        elif context.price_change_24h > 8:
            signals.append(('price_pump', 40, 0.35))
        else:
            signals.append(('price_pump', 0, 0.35))
        
        # Signal 2: Bought near local high (weight: 25%)
        high_distance = self._distance_from_high(trade, context)
        if high_distance < 3:  # Within 3% of local high
            signals.append(('near_top', 100, 0.25))
        elif high_distance < 8:
            signals.append(('near_top', 60, 0.25))
        else:
            signals.append(('near_top', 0, 0.25))
        
        # Signal 3: Volume spike (weight: 15%)
        if context.volume_ratio > 5:  # 5x normal volume
            signals.append(('volume', 100, 0.15))
        elif context.volume_ratio > 3:
            signals.append(('volume', 70, 0.15))
        else:
            signals.append(('volume', 0, 0.15))
        
        # Signal 4: Oversized position (weight: 15%)
        size_ratio = trade.value_usd / context.user_avg_trade_size
        if size_ratio > 3:
            signals.append(('size', 100, 0.15))
        elif size_ratio > 2:
            signals.append(('size', 60, 0.15))
        else:
            signals.append(('size', 0, 0.15))
        
        # Signal 5: Speed of execution (weight: 10%)
        # Faster reaction = more impulsive = more FOMO
        if context.minutes_since_price_move < 30:
            signals.append(('speed', 100, 0.10))
        elif context.minutes_since_price_move < 120:
            signals.append(('speed', 50, 0.10))
        else:
            signals.append(('speed', 0, 0.10))
        
        # Weighted average
        total = sum(score * weight for _, score, weight in signals)
        return min(100, max(0, total))
```

### Revenge Detector (`core/analysis/revenge_detector.py`)

```python
class RevengeDetector:
    """
    Detects revenge trading — trading to recover losses emotionally.
    
    Key signals:
    1. Time since last loss (shorter = more emotional)
    2. New trade size vs loss (bigger = trying to recover)
    3. Token change (switching to different asset = impulsive)
    4. Repeated pattern frequency
    """

    def detect_revenge_trade(
        self, 
        current_trade: Trade, 
        recent_trades: list[Trade]
    ) -> RevengeResult:
        
        # Find most recent loss
        recent_loss = self._find_recent_loss(recent_trades, within_hours=4)
        if not recent_loss:
            return RevengeResult(score=0, reason="No recent loss")
        
        # Time gap
        gap_minutes = (current_trade.timestamp - recent_loss.timestamp).seconds / 60
        
        # Size amplification
        size_ratio = current_trade.value_usd / abs(recent_loss.pnl_usd)
        
        # Token switch (emotional pivot)
        token_switched = current_trade.token_in != recent_loss.token_in
        
        score = 0
        
        # Time component (0-40 points)
        if gap_minutes < 15:
            score += 40
        elif gap_minutes < 30:
            score += 30
        elif gap_minutes < 60:
            score += 20
        elif gap_minutes < 120:
            score += 10
        
        # Size component (0-30 points)
        if size_ratio > 3:
            score += 30
        elif size_ratio > 2:
            score += 20
        elif size_ratio > 1.5:
            score += 10
        
        # Token switch component (0-15 points)
        if token_switched:
            score += 15
        
        # Pattern frequency (0-15 points)
        revenge_count = self._count_revenge_patterns(recent_trades, window_days=30)
        if revenge_count > 5:
            score += 15
        elif revenge_count > 2:
            score += 10
        elif revenge_count > 0:
            score += 5
        
        return RevengeResult(
            score=min(100, score),
            gap_minutes=gap_minutes,
            size_ratio=size_ratio,
            loss_amount=abs(recent_loss.pnl_usd),
            token_switched=token_switched,
            pattern_frequency=revenge_count
        )
```

### Personality Engine (`core/analysis/personality.py`)

```python
class PersonalityEngine:
    """
    Assigns trading personality archetype based on emotional scores
    and behavioral patterns.
    """
    
    ARCHETYPES = {
        'reactive_fomo': {
            'name': 'Reactive FOMO Trader 🏃',
            'description': 'You tend to buy after price pumps, driven by fear of missing out.',
            'trigger_condition': lambda s: s.fomo > 65 and s.panic < 50,
            'coaching_focus': 'patience_and_limit_orders'
        },
        'panic_seller': {
            'name': 'Panic Seller 😱',
            'description': 'You sell during dips, unable to withstand short-term volatility.',
            'trigger_condition': lambda s: s.panic > 65 and s.diamond_hands < 40,
            'coaching_focus': 'conviction_and_position_sizing'
        },
        'revenge_warrior': {
            'name': 'Revenge Warrior 😤',
            'description': 'You trade aggressively after losses, trying to recover quickly.',
            'trigger_condition': lambda s: s.revenge > 55,
            'coaching_focus': 'cooling_off_and_journaling'
        },
        'slot_machine': {
            'name': 'Slot Machine Gambler 🎰',
            'description': 'You overtrade compulsively without clear strategy.',
            'trigger_condition': lambda s: s.overtrade > 65,
            'coaching_focus': 'strategy_and_discipline'
        },
        'diamond_hands': {
            'name': 'Diamond Hands 💎',
            'description': 'You hold conviction through volatility — but may need better exit timing.',
            'trigger_condition': lambda s: s.diamond_hands > 75 and s.fomo < 40,
            'coaching_focus': 'exit_strategy'
        },
        'cold_calculator': {
            'name': 'Cold Calculator 🧊',
            'description': 'You trade systematically with low emotional influence.',
            'trigger_condition': lambda s: all(v < 35 for v in [s.fomo, s.panic, s.revenge, s.overtrade]),
            'coaching_focus': 'fine_tuning'
        },
        'butterfly': {
            'name': 'Butterfly 🦋',
            'description': 'You jump between tokens constantly, lacking focus.',
            'trigger_condition': lambda s: s.overtrade > 50 and self._avg_hold_time < 2,  # days
            'coaching_focus': 'conviction_and_research'
        },
        'slow_steady': {
            'name': 'Slow & Steady 🐢',
            'description': 'You trade carefully and infrequently. Confidence could be your growth area.',
            'trigger_condition': lambda s: s.overtrade < 25 and self._trade_frequency < 5,  # per month
            'coaching_focus': 'confidence_and_scaling'
        }
    }

    def assign_archetype(self, scores: EmotionalScores, patterns: TradePatterns) -> ArchetypeResult:
        # Try each archetype's condition
        for key, archetype in self.ARCHETYPES.items():
            if archetype['trigger_condition'](scores):
                return ArchetypeResult(
                    key=key,
                    name=archetype['name'],
                    description=archetype['description'],
                    coaching_focus=archetype['coaching_focus'],
                    confidence=self._calculate_confidence(scores, key)
                )
        
        # Default: Mixed profile
        return ArchetypeResult(
            key='mixed',
            name='Mixed Profile 🎭',
            description='You show a mix of emotional patterns. No single dominant trait.',
            coaching_focus='awareness',
            confidence=0.5
        )
```

### AI Coach (`core/ai/coach.py`)

```python
class AICoach:
    """
    LLM-powered trading coach that provides personalized advice
    based on the user's behavioral data.
    """
    
    SYSTEM_PROMPT = """
    You are a crypto trading psychologist and coach. You help traders
    understand and improve their emotional trading patterns.
    
    You have access to this user's behavioral analysis:
    
    PERSONALITY: {archetype_name}
    DESCRIPTION: {archetype_description}
    
    EMOTIONAL SCORES (0-100, lower is better except Diamond Hands):
    - FOMO: {fomo_score} {fomo_emoji}
    - Panic Selling: {panic_score} {panic_emoji}
    - Revenge Trading: {revenge_score} {revenge_emoji}
    - Overtrading: {overtrade_score} {overtrade_emoji}
    - Diamond Hands: {diamond_hands_score} {diamond_emoji}
    
    KEY PATTERNS DETECTED:
    {patterns_list}
    
    RECENT TRADES:
    {recent_trades}
    
    ESTIMATED EMOTIONAL LOSS: ${emotional_loss}
    IMPROVEMENT STREAK: {streak} days
    
    RULES:
    1. Always reference SPECIFIC trades from their history
    2. Use exact numbers and dates
    3. Be direct but empathetic — don't sugarcoat, don't be harsh
    4. Give actionable advice with concrete next steps
    5. Celebrate improvements genuinely
    6. When they ask "what should I do", give analysis not financial advice
    7. Never tell them to buy/sell specific tokens
    8. Focus on PROCESS improvement, not profit
    9. Match their communication style (formal/casual)
    10. If they seem emotional, prioritize calming over analysis
    """
    
    async def get_response(self, user_id: str, message: str) -> str:
        # Fetch user's latest analysis data
        profile = await self.analysis_service.get_profile(user_id)
        scores = await self.analysis_service.get_latest_scores(user_id)
        trades = await self.trade_service.get_recent(user_id, limit=10)
        
        # Build context
        system = self.SYSTEM_PROMPT.format(
            archetype_name=profile.archetype,
            archetype_description=profile.description,
            fomo_score=scores.fomo,
            # ... all fields
        )
        
        # Get chat history
        history = await self.chat_service.get_history(user_id, limit=20)
        
        # Call LLM
        response = await self.llm.chat(
            system=system,
            messages=history + [{"role": "user", "content": message}]
        )
        
        # Save message pair
        await self.chat_service.save(user_id, "user", message)
        await self.chat_service.save(user_id, "assistant", response)
        
        return response
```

### Alert Dispatcher (`core/alerts/dispatcher.py`)

```python
class AlertDispatcher:
    """
    Sends alerts to users via their preferred channels.
    """
    
    async def dispatch(self, user_id: str, alert: Alert):
        user = await self.user_service.get(user_id)
        
        # Telegram
        if user.settings.get('telegram_alerts') and user.telegram_chat_id:
            await self.telegram.send(
                chat_id=user.telegram_chat_id,
                message=self._format_telegram(alert),
                parse_mode='HTML'
            )
        
        # Email
        if user.settings.get('email_alerts') and user.email:
            await self.email.send(
                to=user.email,
                subject=alert.title,
                html=self._format_email_html(alert)
            )
        
        # WebSocket (real-time web push)
        await self.ws_manager.send(user_id, {
            'type': 'alert',
            'data': alert.to_dict()
        })
        
        # Store in DB
        await self.alert_repo.create(alert)
    
    def _format_telegram(self, alert: Alert) -> str:
        severity_emoji = {
            'critical': '🔴',
            'warning': '⚠️',
            'info': 'ℹ️',
            'positive': '🟢'
        }
        emoji = severity_emoji.get(alert.severity, '📢')
        
        return f"""
{emoji} <b>{alert.title}</b>

{alert.message}

<i>Based on your trading patterns • {alert.created_at.strftime('%H:%M UTC')}</i>
        """
```

---

## Celery Task Definitions

### Background Scan Task

```python
@celery_app.task(bind=True, max_retries=3)
def scan_wallet(self, user_id: str, wallet_address: str, chain: str):
    """
    Full wallet scan pipeline:
    1. Fetch all transactions from blockchain
    2. Parse and identify DEX trades
    3. Calculate USD values
    4. Store in database
    5. Trigger analysis
    """
    try:
        # Step 1: Fetch transactions
        txs = fetcher.fetch_all(wallet_address, chain)
        update_progress(user_id, 'fetching', len(txs))
        
        # Step 2: Parse trades
        trades = parser.parse_transactions(txs, chain)
        update_progress(user_id, 'parsing', len(trades))
        
        # Step 3: Store
        trade_repo.bulk_create(trades)
        
        # Step 4: Trigger analysis
        analyze_wallet.delay(user_id, wallet_address)
        
    except Exception as exc:
        self.retry(exc=exc, countdown=60)


@celery_app.task(bind=True)
def analyze_wallet(self, user_id: str, wallet_address: str):
    """
    Run full behavioral analysis:
    1. Score each trade for emotional indicators
    2. Calculate aggregate emotional scores
    3. Assign personality archetype
    4. Generate insights
    5. Send results notification
    """
    trades = trade_repo.get_by_wallet(wallet_address)
    
    # Score each trade
    for trade in trades:
        fomo = fomo_detector.calculate_fomo_score(trade, context)
        panic = panic_detector.detect_panic_sell(trade, context)
        revenge = revenge_detector.detect_revenge_trade(trade, recent)
        trade.emotion_tag = max(fomo, panic, revenge, key=lambda x: x.score)
    
    # Aggregate scores
    scores = scoring.calculate_aggregate(trades)
    score_repo.save(scores)
    
    # Personality
    personality = personality_engine.assign_archetype(scores, patterns)
    profile_repo.save(personality)
    
    # Notify user
    alert_dispatcher.dispatch(user_id, Alert(
        type='scan_complete',
        title='🧠 Analysis Complete!',
        message=f'Your trading personality: {personality.name}'
    ))
```

### Scheduled Alert Check

```python
@celery_app.task
def check_alerts():
    """
    Runs every 5 minutes via Celery Beat.
    Checks all active users for alert conditions.
    """
    active_users = user_service.get_active_users()
    
    for user in active_users:
        trades = trade_repo.get_recent(user.id, hours=2)
        
        # Check FOMO: Is user about to buy a pumping token?
        for trade in trades:
            if trade.is_buy and context.price_change_24h > 15:
                alert = fomo_alert(user, trade, context)
                if alert:
                    alert_dispatcher.dispatch(user.id, alert)
        
        # Check Revenge: Recent loss + new trade
        revenge = revenge_detector.check_revenge_window(user.id)
        if revenge and revenge.score > 60:
            alert_dispatcher.dispatch(user.id, revenge_alert(user, revenge))
        
        # Check Overtrade: Trade count today
        today_count = trade_repo.count_today(user.id)
        if today_count > user.settings.get('max_daily_trades', 5):
            alert_dispatcher.dispatch(user.id, overtrade_alert(user, today_count))
```

---

## Docker Compose (Local Dev)

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      - db
      - redis
    volumes:
      - .:/app
    command: uvicorn app.main:app --reload --host 0.0.0.0

  celery-worker:
    build: .
    env_file: .env
    depends_on:
      - db
      - redis
    command: celery -A app.tasks.celery_app worker --loglevel=info

  celery-beat:
    build: .
    env_file: .env
    depends_on:
      - db
      - redis
    command: celery -A app.tasks.celery_app beat --loglevel=info

  db:
    image: timescale/timescaledb:latest-pg16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: crypto_therapist
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## Implementation Order

### Week 2-3: Backend Foundation
1. FastAPI project setup + config
2. Database models + Alembic migrations
3. Auth (SIWE + JWT)
4. User & Wallet CRUD endpoints
5. Blockchain fetcher (Ethereum first)
6. Transaction parser + DEX detector
7. Price service integration

### Week 3-4: Analysis Engine
8. FOMO detector algorithm
9. Panic sell detector
10. Revenge trade detector
11. Overtrade detector
12. Diamond hands scorer
13. Personality archetype engine
14. Aggregate scoring system

### Week 4-5: AI & Alerts
15. AI coach (LLM integration)
16. Insight generator
17. Report generator (daily/weekly)
18. Alert detector pipeline
19. Telegram bot alerts
20. Email alerts (SendGrid)
21. WebSocket real-time push
22. Celery background tasks

### Week 5-6: Polish & Test
23. Multi-chain support (BSC, Polygon, Arbitrum, Base)
24. API rate limiting + caching
25. Error handling + logging
26. Unit tests (all detectors)
27. Integration tests (scan pipeline)
28. API documentation (Swagger)
