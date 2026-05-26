# ⚡ Energy Monitor — Android App

**Solar + Utility Energy Intelligence Platform** for AccuTek Solar.

Native Android app built with Kotlin + Jetpack Compose + Material Design 3.

## Features

### Authentication
- Email/password sign-up & sign-in via Firebase
- Auto token refresh for API calls

### Setup Wizard
- Create site (property)
- Connect Emporia Vue (consumption monitoring)
- Connect SMA Sunny Portal (solar production)

### Dashboard
- Live solar production & consumption
- Net grid status (importing/exporting)
- Today's generation & consumption
- Monthly solar offset percentage
- Active alerts & diagnostics

### Solar Analytics
- Current production
- Inverter status
- Self-consumption ratio
- Historical production charts

### Billing Validation
- Upload Duke Energy bills (PDF/CSV)
- Bill vs. measured usage comparison
- TOU optimization tips

### Settings
- Account management
- Device connections
- Notification preferences
- TOU rate configuration

## Tech Stack

- **Language:** Kotlin
- **UI:** Jetpack Compose + Material Design 3
- **Navigation:** Navigation Compose
- **Auth:** Firebase Authentication
- **Networking:** Retrofit + OkHttp
- **Local DB:** Room
- **DI:** Hilt
- **Charts:** MPAndroidChart
- **Background:** WorkManager
- **Theme:** Dark mode default (energy-themed palette)

## Setup

1. Clone the repo
2. Open in Android Studio (Hedgehog or later)
3. Add your `google-services.json` from Firebase Console to `app/`
4. Update `API_BASE_URL` in `app/build.gradle.kts` if needed
5. Build & run

## Architecture

```
UI (Compose Screens)
    ↓
ViewModels (Hilt-injected)
    ↓
Repository
    ↓
Retrofit API ←→ Backend
Room DB (offline cache)
```

## License

Proprietary — AccuTek Solar
