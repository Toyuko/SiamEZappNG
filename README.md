# SiamEZ Mobile App (Expo + React Native)

Production-oriented mobile app for iOS, Android, and web that consumes the SiamEZ web backend APIs.

## Core Architecture

- `app/`: Route-driven screens (Expo Router), tabs + stacks.
- `components/`: Shared UI building blocks and providers.
- `features/`: Domain modules (`auth`, `cases`, `documents`, `dashboard`) with local API/hooks.
- `lib/`: Infra utilities (`api`, `config`, `storage`, `theme`, `datetime`).
- `store/`: Global state (`zustand`) for session/user state.

## Navigation (soft launch)

When `EXPO_PUBLIC_SOFT_LAUNCH` is enabled (default), primary tabs are:

- **Services** — browse and search the service catalog
- **Sales** — vehicles / sales listings
- **Real Estate** — property listings
- **Concierge** — AI concierge (via More hub routes)
- **More** — Ask SiamEZ, search, account shortcuts, deferred tabs

Guests also see **Contact**. Signed-in members reach **Cases**, **Book**, **Profile**, and related screens from More or deep links.

Corporate users get a separate tab set (Insights / Jobs / Create Ad / My Profile).

Auth stack: `/(auth)/login`, `/(auth)/signup`.

## Backend integration

Set the API base URL (no trailing `/api` required — paths include it):

```bash
EXPO_PUBLIC_API_URL=https://siam-e-zweb-ng.vercel.app
```

Legacy alias `EXPO_PUBLIC_API_BASE_URL` is still read by `lib/config.ts`.

Production endpoints use the `/api/...` prefix, for example:

- `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- `GET /api/client/dashboard/overview`, `GET /api/client/cases`
- `POST /api/users/push-token`, document upload routes under `/api/...`

## Booking

The **Book** tab uses the same booking system as the website: it submits to
`POST /api/bookings` with the canonical service slug and `formData` / `documentIds`,
and shows the returned case number (guests get a checkout token). The backend
resolves the slug to a service record (`getOrEnsureServiceBySlug`), so the app and
website create identical cases.

## Run

1. `npm install`
2. Copy `.env.example` to `.env` and set variables (do **not** commit `.env`).
3. `npm run ios` or `npm run android` (native), or `npm run web` for React Native Web.
4. `npm test` — Vitest unit tests; `npm run typecheck` for TypeScript.

## Environment flags

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | Backend base URL |
| `EXPO_PUBLIC_SOFT_LAUNCH` | Soft-launch tab IA (`false` to disable) |
| `EXPO_PUBLIC_PUSHER_KEY` / `EXPO_PUBLIC_PUSHER_CLUSTER` | Real-time job board (optional) |

See `.env.example` for defaults and local emulator notes.
