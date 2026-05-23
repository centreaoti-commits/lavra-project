# 🚀 CRYPTO THERAPIST AGENT — MASTER PLAN
## Dari 15% ke Production-Ready

> **Kondisi saat ini:** Kode ada 146 file, build pass, 20 unit tests pass.
> **Tapi:** Gak ada database, gak ada Redis, gak ada .env, gak pernah jalan beneran.
> **Target:** Full working app yang bisa dipakai user.

---

## PHASE 1: INFRASTRUCTURE SETUP
### Tujuan: Bikin backend bisa jalan dan terima request

---

### Step 1.1: Install PostgreSQL
```bash
apt update && apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### Step 1.2: Create Database & User
```bash
sudo -u postgres psql -c "CREATE USER ct_admin WITH PASSWORD 'ct_secure_2026';"
sudo -u postgres psql -c "CREATE DATABASE crypto_therapist OWNER ct_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE crypto_therapist TO ct_admin;"
```

### Step 1.3: Install Redis
```bash
apt install -y redis-server
systemctl start redis
systemctl enable redis
redis-cli ping  # Should return PONG
```

### Step 1.4: Create .env File
**File:** `/root/crypto-therapist-agent/.env`
```env
# App
APP_NAME=Crypto Therapist
DEBUG=true
SECRET_KEY=ct-prod-secret-key-change-me-2026

# Database
DATABASE_URL=postgresql+asyncpg://ct_admin:ct_secure_2026@localhost:5432/crypto_therapist
DATABASE_ECHO=false

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# Blockchain APIs (get free keys from etherscan.io etc)
ETHERSCAN_API_KEY=
BSCSCAN_API_KEY=
POLYGONSCAN_API_KEY=
ARBISCAN_API_KEY=

# AI
OPENAI_API_KEY=
AI_MODEL=gpt-4o

# Price API
COINGECKO_API_KEY=

# Telegram (optional)
TELEGRAM_BOT_TOKEN=

# Email (optional)
SENDGRID_API_KEY=
FROM_EMAIL=noreply@crypto-therapist.io
```

### Step 1.5: Fix Config — Redis URL
**File:** `backend/app/config.py`
**Issue:** REDIS_URL defaults ke `redis://localhost:***@crypto-therapist.io` (wrong)
**Fix:** Ganti default ke `redis://localhost:6379/0`

### Step 1.6: Setup Alembic Migrations
```bash
cd /root/crypto-therapist-agent/backend
# Create alembic.ini
# Create alembic/env.py with our models
# Generate initial migration
# Run migration
```
**File baru:** `backend/alembic.ini`
**File baru:** `backend/alembic/env.py`
**File baru:** `backend/alembic/versions/001_initial.py`

### Step 1.7: Verify Backend Starts
```bash
cd /root/crypto-therapist-agent/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
curl http://localhost:8000/health
# Expected: {"status":"ok","version":"1.0.0"}
curl http://localhost:8000/docs
# Expected: Swagger UI
```

**Checkpoint:** Backend running, database connected, Swagger UI accessible.

---

## PHASE 2: API TESTING (Backend Only)
### Tujuan: Setiap endpoint beneran jalan dengan data real

---

### Step 2.1: Auth Flow Test
```bash
# 2.1.1 — Get nonce
curl -X POST http://localhost:8000/api/v1/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"address":"0xbe58F53D173a91AD7952C865CbbA24a1F51CB06f"}'

# Expected: {"nonce":"...","message":"Sign this message to verify..."}

# 2.1.2 — Verify signature (need real wallet signature)
# This needs a real wallet to sign the message
# For testing, create a test endpoint or mock

# 2.1.3 — Get JWT token
# Expected: {"token":"eyJ...","user_id":"...","address":"0x..."}
```

### Step 2.2: User Profile Test
```bash
TOKEN="<jwt_from_step_2.1>"

# Get profile
curl http://localhost:8000/api/v1/user/profile \
  -H "Authorization: Bearer $TOKEN"

# Update settings
curl -X PATCH http://localhost:8000/api/v1/user/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notifications_enabled":true}'
```

### Step 2.3: Wallet Scan Test (REAL DATA)
```bash
# Scan with real wallet address
curl -X POST http://localhost:8000/api/v1/analysis/scan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address":"0xbe58F53D173a91AD7952C865CbbA24a1F51CB06f",
    "chains":["ETH"]
  }'

# Expected: {"wallet_id":"...","trades_found":N,"new_trades":N,...}

# Get analysis
curl http://localhost:8000/api/v1/analysis/0xbe58F53D173a91AD7952C865CbbA24a1F51CB06f \
  -H "Authorization: Bearer $TOKEN"
```

### Step 2.4: Trades Test
```bash
# Get trades
curl "http://localhost:8000/api/v1/trades?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Get stats
curl http://localhost:8000/api/v1/trades/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Step 2.5: Chat Test
```bash
# Send message to AI coach
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is my trading personality?"}'

# Expected: {"response":"Based on your analysis..."}

# Get history
curl http://localhost:8000/api/v1/chat/history?limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

### Step 2.6: Alerts Test
```bash
# Get alerts
curl "http://localhost:8000/api/v1/alerts?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Mark as read
curl -X PATCH http://localhost:8000/api/v1/alerts/<alert_id>/read \
  -H "Authorization: Bearer $TOKEN"
```

### Step 2.7: Fix Bugs Found
Semua bug yang muncul dari testing di atas harus di-fix sebelum lanjut.

**Checkpoint:** Semua 23 endpoints tested dan working dengan real data.

---

## PHASE 3: FRONTEND-BACKEND INTEGRATION
### Tujuan: Frontend beneran connect ke backend, bukan mock data

---

### Step 3.1: Setup Frontend Environment
**File:** `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<get_from_walletconnect.com>
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Step 3.2: Start Both Services
```bash
# Terminal 1 — Backend
cd /root/crypto-therapist-agent/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd /root/crypto-therapist-agent/frontend
npm run dev
```

### Step 3.3: Test Onboarding Flow
1. Buka http://localhost:3000
2. Klik "Connect Wallet" (MetaMask/WalletConnect)
3. Sign message untuk verifikasi
4. Tunggu scan selesai
5. Verify: dashboard muncul dengan data real

### Step 3.4: Test Dashboard
1. Stats bar — harus show real trades count, PnL, win rate
2. Emotional radar — harus show real scores
3. Trades table — harus show real trades dari blockchain
4. AI Coach — harus bisa chat dan dapat response dari OpenAI

### Step 3.5: Test Other Pages
1. History — filter by emotion, pagination working
2. Alerts — real alerts muncul, bisa mark as read
3. Profile — wallet management, settings
4. Reports — generate report

### Step 3.6: Fix UI Bugs
Semua bug visual, data mismatch, loading issues harus di-fix.

**Checkpoint:** Full user journey working: connect → scan → dashboard → chat.

---

## PHASE 4: CELERY WORKER & BACKGROUND TASKS
### Tujuan: Background processing jalan beneran

---

### Step 4.1: Start Celery Worker
```bash
cd /root/crypto-therapist-agent/backend
celery -A app.tasks.celery_app worker --loglevel=info --concurrency=2
```

### Step 4.2: Start Celery Beat (Scheduler)
```bash
celery -A app.tasks.celery_app beat --loglevel=info
```

### Step 4.3: Test Background Scan
```bash
# Trigger scan (should dispatch to Celery)
curl -X POST http://localhost:8000/api/v1/analysis/scan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"0x...","chains":["ETH"]}'

# Check task status
curl http://localhost:8000/api/v1/analysis/scan/<task_id>/status \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4.4: Test Report Generation
```bash
# Trigger report
curl -X POST http://localhost:8000/api/v1/reports/generate \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4.5: Test Rescan Cron
Verify `rescan_active_wallets` task runs automatically.

**Checkpoint:** Celery worker processing tasks, background scan working.

---

## PHASE 5: ALERTS & NOTIFICATIONS
### Tujuan: User dapat notifikasi real-time

---

### Step 5.1: WebSocket Test
```javascript
// Connect dari browser console
const ws = new WebSocket('ws://localhost:8000/ws/<user_id>');
ws.onmessage = (e) => console.log('Alert:', JSON.parse(e.data));
ws.send('ping'); // Should get 'pong'
```

### Step 5.2: Trigger Alert
```bash
# Create test alert via API
curl -X POST http://localhost:8000/api/v1/alerts/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"fomo_spike","title":"FOMO Alert","message":"Your FOMO score jumped 30 points"}'
```

### Step 5.3: Telegram Bot Setup (Optional)
1. Chat @BotFather → /newbot → get token
2. Set TELEGRAM_BOT_TOKEN di .env
3. Test send alert ke Telegram

### Step 5.4: Email Alerts Setup (Optional)
1. Get SendGrid API key
2. Set SENDGRID_API_KEY di .env
3. Test send email alert

**Checkpoint:** Real-time alerts via WebSocket, optional Telegram/Email.

---

## PHASE 6: PRODUCTION DEPLOYMENT
### Tujuan: App bisa diakses public

---

### Step 6.1: Docker Production Build
```bash
cd /root/crypto-therapist-agent
docker-compose build
docker-compose up -d
```

### Step 6.2: Environment Hardening
- Ganti SECRET_KEY dengan random 64-char string
- Set DEBUG=false
- Setup proper CORS origins
- Setup SSL/TLS (nginx reverse proxy)

### Step 6.3: Database Backup
```bash
pg_dump crypto_therapist > backup_$(date +%Y%m%d).sql
```

### Step 6.4: Monitoring
- Health check endpoint: GET /health
- Celery monitoring: flower
- Error tracking: Sentry (optional)

**Checkpoint:** Production running di server, accessible via domain.

---

## PHASE 7: TESTING & QUALITY
### Tujuan: Confidence bahwa semuanya works

---

### Step 7.1: Integration Tests
```python
# tests/integration/test_auth_flow.py
# tests/integration/test_scan_flow.py
# tests/integration/test_chat_flow.py
# tests/integration/test_alert_flow.py
```

### Step 7.2: E2E Tests (Optional)
```bash
# Playwright/Cypress untuk test full user journey
npx playwright test
```

### Step 7.3: Load Testing (Optional)
```bash
# Test dengan banyak concurrent users
locust -f loadtest.py --host=http://localhost:8000
```

---

## EKSEKUSI ORDER

```
Phase 1 (Infrastructure)  → ~30 menit  (install DB, Redis, .env, migrations)
Phase 2 (API Testing)     → ~2 jam     (test semua endpoint, fix bugs)
Phase 3 (Frontend-Backend)→ ~2 jam     (connect, test full flow, fix UI)
Phase 4 (Celery)          → ~1 jam     (worker, beat, background tasks)
Phase 5 (Alerts)          → ~1 jam     (WebSocket, Telegram, Email)
Phase 6 (Production)      → ~2 jam     (Docker, hardening, deploy)
Phase 7 (Testing)         → ~2 jam     (integration, E2E)
─────────────────────────────────────────
TOTAL                     → ~11 jam
```

---

## API KEYS YANG DIBUTUHKAN

| Key | Where to get | Required? |
|---|---|---|
| ETHERSCAN_API_KEY | etherscan.io/apis (free) | ✅ Ya |
| OPENAI_API_KEY | platform.openai.com | ✅ Ya |
| WALLETCONNECT_PROJECT_ID | cloud.walletconnect.com | ✅ Ya |
| COINGECKO_API_KEY | coingecko.com/api (free tier) | 🟡 Opsional |
| TELEGRAM_BOT_TOKEN | @BotFather di Telegram | 🟡 Opsional |
| SENDGRID_API_KEY | sendgrid.com | 🟡 Opsional |

---

## FILE BARU YANG PERLU DIBUAT

1. `.env` — Environment variables
2. `backend/alembic.ini` — Alembic config
3. `backend/alembic/env.py` — Alembic environment
4. `backend/alembic/versions/001_initial.py` — Initial migration
5. `frontend/.env.local` — Frontend environment
6. `backend/tests/integration/` — Integration tests

## FILE YANG PERLU DI-FIX

1. `backend/app/config.py` — Fix Redis URL default
2. `backend/app/config.py` — Add CORS_ORIGINS type fix
