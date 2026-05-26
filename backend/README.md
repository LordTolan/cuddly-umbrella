# ⚡ Energy Monitor — Backend API

**Solar + Utility Energy Intelligence Platform** for AccuTek Solar.

Correlates solar production (SMA), home consumption (Emporia Vue), and utility billing (Duke Energy) into a unified analytics platform.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Cache/Queue:** Redis + BullMQ
- **Auth:** Firebase Authentication
- **Deployment:** Render.com

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register (after Firebase signup) |
| POST | `/auth/login` | Login & get profile |
| GET | `/auth/me` | Current user |
| GET/POST | `/sites` | List/create sites |
| GET | `/devices` | List connected devices |
| POST | `/devices/connect` | Connect Emporia/SMA device |
| GET | `/energy/live` | Live dashboard data |
| GET | `/energy/history` | Historical data |
| GET | `/energy/offset` | Solar offset analysis |
| GET | `/energy/savings` | Estimated savings |
| GET | `/energy/peak` | Peak demand analysis |
| GET | `/solar/live` | Current solar production |
| GET | `/solar/history` | Solar history |
| GET | `/solar/self-consumption` | Self-consumption ratio |
| POST | `/billing/upload` | Upload Duke bill (PDF/CSV) |
| GET | `/billing/analysis` | Bill validation |
| GET | `/billing/history` | Bill history |
| GET | `/alerts` | List alerts |
| GET | `/health` | Health check |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Run database migrations
npx prisma migrate deploy

# 4. Start the API
npm run dev

# 5. Start the worker (separate terminal)
npm run worker
```

## Deploy to Render

1. Push to GitHub
2. In Render: **New > Blueprint Instance**
3. Connect this repo
4. Set Firebase env vars manually
5. Done — auto-deploys on push

## External APIs

- **Emporia Vue** — Community REST API (polling consumption data)
- **SMA Sunny Portal** — OAuth REST API (solar production)
- **Duke Energy** — Manual PDF/CSV upload (Phase 1), Green Button (Phase 2)

## Architecture

```
Android App → Backend API → PostgreSQL
                 ↕              ↕
            Redis/BullMQ   TimescaleDB
                 ↕
         Background Worker
          ├─ Emporia Poller
          ├─ SMA Poller
          └─ Alert Generator
```

## License

Proprietary — AccuTek Solar
