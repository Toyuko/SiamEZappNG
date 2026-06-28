# AGENTS.md

## Cursor Cloud specific instructions

SiamEZ is an **Expo + React Native (TypeScript) mobile app** (single project, not a
monorepo). It is frontend-only and consumes a remote backend
(`EXPO_PUBLIC_API_URL`, default `https://siam-e-zweb-ng.vercel.app`). There is no
local database or in-repo backend to run. Standard commands live in
`package.json` scripts — refer to them rather than reinventing.

### What runs in this headless cloud VM

- Native targets (`npm run ios` / `npm run android`) need Xcode / Android SDK +
  simulators, which are **not available here**. Use the **web target**
  (`npm run web`, React Native Web via Metro on `http://localhost:8081`) to run
  and demo the app.
- `npm test` (Vitest) and `npm run typecheck` run fully offline.
- `npm run typecheck` currently reports **pre-existing** errors (e.g. missing
  test-runner types in `tests/unit/tracking-image.test.ts`, a `gifted-chat`
  prop typing in `screens/Chat/JobChatScreen.tsx`). These are not caused by
  environment setup; don't treat a clean typecheck as a prerequisite.

### Web target gotchas (non-obvious)

- The web bundle needs `unstable_transformImportMeta: true` on `babel-preset-expo`
  (already set in `babel.config.js`). Without it, an ESM dependency
  (`zustand/middleware` uses `import.meta.env`) crashes the browser bundle with
  *"Cannot use 'import' meta outside a module"* and the page renders blank. This
  flag becomes the default in Expo SDK 56 and is a no-op on native.
- `expo-secure-store` has **no web implementation** (its web module is empty), so
  `getToken()` / `getUserRole()` reject on web. This is handled gracefully:
  `bootstrapSession()` in `hooks/use-auth.ts` wraps the read in try/catch and
  still calls `setBootstrapping(false)`, so the app falls through to the login
  screen. The unauthenticated/guest flow (login → "Continue as Guest" → home →
  service search) works without any code changes. Authenticated persistence
  across web reloads is the only thing that won't work. In **dev mode** this
  surfaces as a dismissible Expo redbox overlay
  (`ExpoSecureStore.default.deleteValueWithKeyAsync is not a function`, plus a
  NativeWind `dark mode is type 'media'` warning) — close it and the app is fully
  usable. These overlays do not appear in a production web export.
- After changing `babel.config.js` / `metro.config.js`, restart Metro with
  `npm run web -- --clear` so the cache rebuilds.
- The dev web bundle is large (~13 MB). The Chrome tab can crash ("Aw, Snap!
  Error code: 4") on heavier routes in constrained VMs; this is a renderer
  resource limit, not necessarily an app bug.

### Lint / test / build / run quick reference

- Static check (no ESLint configured): `npm run typecheck`
- Unit/integration tests: `npm test` (Vitest)
- Run (web, dev): `npm run web` → `http://localhost:8081`
- Web export (build): `npm run build:web:test` (outputs `dist/`)
- E2E: `npm run test:e2e` (Playwright; needs `npx playwright install chromium`).
  The config auto-builds the web export and serves it on port 4173.
