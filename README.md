# ⚡ Energy Monitor — cuddly-umbrella

**Solar + Utility Energy Intelligence Platform** by AccuTek Solar.

## Structure

```
├── backend/    — Node.js API (Express, Prisma, BullMQ, Firebase Auth)
├── android/    — Android app (Kotlin, Jetpack Compose, Material 3)
└── web/        — React web app (Vite, Tailwind, Recharts, Firebase Auth)
```

## Backend
- REST API with 17 endpoints (auth, sites, devices, energy, solar, billing, alerts)
- Emporia Vue + SMA Sunny Boy integrations
- Duke Energy bill parsing & validation
- Analytics engine (solar offset, self-consumption, savings)
- BullMQ background workers
- Render.com deployment blueprint

## Android
- Kotlin + Jetpack Compose + Material Design 3 (dark energy theme)
- Firebase Authentication
- Setup wizard (site → Emporia → SMA)
- Live dashboard with KPIs, net grid, monthly offset, alerts
- Solar analytics, billing validation, settings
- Hilt DI, Retrofit, Room, WorkManager

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env  # fill in your keys
npm install
npx prisma migrate dev
npm run dev
```

### Android
1. Open `android/` in Android Studio
2. Add `google-services.json` to `android/app/`
3. Update `API_BASE_URL` in `app/build.gradle.kts`
4. Build & run

## License
Proprietary — AccuTek Solar
