# SiamEZ Mobile App (Expo + React Native)

Production-oriented mobile foundation for iOS and Android that reuses SiamEZ web backend APIs.

## Core Architecture

- `app/`: Route-driven screens (Expo Router), tabs + stacks.
- `components/`: Shared UI building blocks and providers.
- `features/`: Domain modules (`auth`, `cases`, `dashboard`) with local API/hooks.
- `lib/`: Infra utilities (`api`, `config`, `storage`, `theme`).
- `store/`: Global state (`zustand`) for session/user state.

## Navigation

- Auth stack:
  - `/(auth)/login`
- Main tabs:
  - `/(tabs)/home`
  - `/(tabs)/cases`
  - `/(tabs)/book`
  - `/(tabs)/documents`
  - `/(tabs)/profile`
- Shared stack screens:
  - `/cases/[id]`

## Existing Backend Integration

Configured via `EXPO_PUBLIC_API_BASE_URL` (default: `https://siam-e-zweb-ng.vercel.app/api`).

Current endpoints used:

- `POST /auth/login`
- `GET /auth/me`
- `GET /client/dashboard/overview`
- `GET /client/cases`

### Suggested endpoint additions if missing

- `GET /client/cases/:id` (status, timeline, documents, notes, assigned staff)
- `GET /client/invoices`
- `POST /client/invoices/:id/payment-proof`
- `POST /client/cases/:id/documents`
- `POST /bookings` (guest + authenticated)
- `GET /client/notifications`

## Run

1. `npm install`
2. Set `.env` with:
   - `EXPO_PUBLIC_API_BASE_URL=https://your-backend-url/api`
3. `npm run ios` or `npm run android`
