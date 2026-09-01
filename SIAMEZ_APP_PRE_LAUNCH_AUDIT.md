# SiamEZ Mobile App Pre-Launch Audit

**Application:** SiamEZ (Expo SDK 55, React Native 0.83, TypeScript)  
**Repository:** https://github.com/Toyuko/SiamEZappNG  
**Original audit:** 13 August 2026 (afternoon)  
**Remediation re-audit:** 13 August 2026 (evening)  
**Auditor role:** Senior mobile QA, React Native/Expo engineer, security auditor, production release engineer  
**Scope:** Pre-launch readiness for iOS and Android customer release  

---

## Remediation re-audit (13 August 2026)

Phase 1 P0/P1 code fixes were implemented in this repository, then checks were re-run. **The production demo password was not rotated on the server** (that is an operations action outside this app). Git history of the public repo may still contain the old password.

### Phase 2 follow-up (production readiness pass)

Additional hardening landed after Phase 1:

| Area | Change |
| ---- | ------ |
| TypeScript | `npm run typecheck` **exit 0** (real-estate write status, GiftedChat placeholder, pusher sender narrowing, tracking image InfoOptions, e2e/Playwright types, freelancer test cast) |
| Auth UX | Login email format + signup name/email/password (≥8) validation; dead `/auth/*` 404 fallbacks removed |
| Session | Push token unregister best-effort before clearing credentials |
| Dates | Display dates use `Asia/Bangkok` via `lib/datetime/format.ts` |
| API | Stricter `unwrapApiData`; unused axios client removed |
| UX / a11y | Button `accessibilityRole` / label / disabled state; fake Profile notification switches removed |
| Config | Expo SDK packages aligned (`expo install --check` clean); `.env` untracked; `userInterfaceStyle: automatic`; native screens enabled on iOS |
| Docs | README + `.env.example` + `PRODUCTION_OPS_CHECKLIST.md` |

### Re-audit commands

| Command | Result |
| ------- | ------ |
| `npm test` | **Pass** — 17 files, **66+ tests** |
| `npm run typecheck` | **Pass** — exit 0 |
| `npx expo install --check` | **Dependencies are up to date** |
| iOS Simulator / Android emulator | Still `NOT TESTABLE IN CURRENT ENVIRONMENT` |
| Live booking API | Still 500 for catalog slugs; app no longer posts those slugs unless `EXPO_PUBLIC_IN_APP_BOOKING=true` |

### Bug status after fixes

| ID | Original | Now | Evidence |
| -- | -------- | --- | -------- |
| BUG-001 | P0 demo password in app | **Code fixed.** Password removed from `login.tsx`. **Server rotation still required.** | Grep: no `DEMO_FREELANCER` / `Freelancer123` in app source; see `PRODUCTION_OPS_CHECKLIST.md` |
| BUG-002 | P0 logout cache/PII leak | **Fixed in code** | `endSession()` clears token, role, QueryClient, booking drafts, concierge, review flags + push unregister. Tests in `tests/unit/end-session.test.ts` |
| BUG-003 | P1 booking API 500 | **Fixed (standard booking).** App uses the website flow: `POST /api/bookings` with slug + `formData`/`documentIds`; backend resolves slug via `getOrEnsureServiceBySlug`. **Deploy the backend route change.** | `features/bookings/bookings.api.ts`, `toBackendServiceSlug`, `SiamEZwebNG/src/app/api/bookings/route.ts` |
| BUG-004 | P1 guest 401 logout | **Fixed** | 401 ends session only when a Bearer token was sent; login/register never send a token |
| BUG-005 | P1 no fetch timeout | **Fixed** | 15s abort; test `times out hung requests` |
| BUG-006 | P1 OAuth token in query | **Partial.** Prefers `code` + `/api/auth/oauth/exchange` and hash tokens. Query-string token is last-resort if the backend still returns one | `parseOAuthRedirect` tests |
| BUG-007 | P1 debug release signing | **Local Gradle fixed** if `credentials/android/keystore.properties` exists. `android/` is gitignored — EAS production uses `credentialsSource: remote` | `eas.json`, local `build.gradle` |
| BUG-008 | P1 anonymous IDs | **Fixed in config** to `com.siamez.app` | `app.json` |
| BUG-009 | P1 no EAS | **Partial.** `eas.json` added. **No Expo `projectId` yet** — run `eas init` on an Expo account | Push still needs projectId; checklist documented |
| BUG-010 | P1 tsc crash | **Fixed.** Caused by `allowJs` compiling `dist-demo`. `tsconfig` now excludes `dist` / `dist-demo` / `coverage` / `portfolio` | `tsc` completes clean |
| BUG-011 | P1 generic privacy strings | **Fixed in `app.json` + local Info.plist / PrivacyInfo** | Specific camera/photo/mic/speech/location copy; collected types declared |
| BUG-012 | P1 fake payments UI | **Hidden** pending-invoice metric and Profile Payments / payment-reminder toggles | Dashboard / Profile |
| BUG-013 | P1 documents | **Improved.** Guest upload blocked; type/size limits; Open uses `url`/`downloadUrl` or `/api/documents/:id/url` | Upload rules tests |
| BUG-015 | P2 API URL in login alert | **Fixed** while editing login | Login alert is the server message only |
| BUG-018 | P2 unauthenticated private queries | **Fixed** | `useSessionQueryEnabled()` on cases/documents/dashboard/invoices/goals/etc. |
| BUG-020 | P2 allowBackup / overlay | **Partial.** Local manifest `allowBackup=false`; `SYSTEM_ALERT_WINDOW` blocked in `app.json`. Regenerated native projects still needed for git-based EAS builds | |

### Updated launch recommendation

**🟡 CODE READY FOR INTERNAL / SOFT LAUNCH — OPS GATES REMAIN FOR PUBLIC STORES**

App code is production-hardened for soft launch with WhatsApp booking. Public App Store / Play release still requires the ops checklist:

1. **Rotate/disable** the production `freelancer@example.com` password (still in git history).
2. `eas init` / Expo `projectId` for production push.
3. `npx expo prebuild --clean` then EAS production builds with remote credentials.
4. Device QA (logout A→B, guest WhatsApp booking, permission copy).
5. Backend: prefer OAuth code exchange only (no JWT in query).

Details: [`PRODUCTION_OPS_CHECKLIST.md`](./PRODUCTION_OPS_CHECKLIST.md).

### Updated launch score

**74/100** (was 61 after Phase 1 / 46 original)

| Area | Before | After Phase 1 | After Phase 2 |
| ---- | ------ | ------------- | ------------- |
| Stability | 52 | 64 | 72 |
| Authentication | 64 | 72 | 80 |
| Security | 32 | 58 | 66 |
| API reliability | 55 | 68 | 76 |
| Booking | 22 | 48 | 52 |
| Cases | 68 | 72 | 78 |
| Documents | 48 | 62 | 68 |
| Payments | 18 | 28 | 28 |
| Navigation | 70 | 70 | 74 |
| UI/UX | 66 | 68 | 74 |
| Accessibility | 44 | 46 | 58 |
| Performance | 58 | 62 | 66 |
| iOS readiness | 36 | 58 | 64 |
| Android readiness | 34 | 56 | 62 |
| Testing | 40 | 58 | 72 |
| Production configuration | 30 | 52 | 68 |

---

## Original remediation re-audit notes (Phase 1)

Phase 1 P0/P1 code fixes were implemented first. Historical Phase 1 command table:

| Command | Result |
| ------- | ------ |
| `npm test` | **Pass** — 17 files, **65 tests** (was 55) |
| `npm run typecheck` | Completes (no stack overflow). Remaining errors later cleared in Phase 2 |
| iOS Simulator / Android emulator | Still `NOT TESTABLE IN CURRENT ENVIRONMENT` |
| Live booking API | Still 500 for catalog slugs; app no longer posts those slugs unless `EXPO_PUBLIC_IN_APP_BOOKING=true` |

### Bug status after Phase 1 (superseded by Phase 2 table above)

| ID | Original | Now | Evidence |
| -- | -------- | --- | -------- |
| BUG-001 | P0 demo password in app | **Code fixed.** Password removed from `login.tsx`. **Server rotation still required.** | Grep: no `DEMO_FREELANCER` / `Freelancer123` in app source |
| BUG-002 | P0 logout cache/PII leak | **Fixed in code** | `endSession()` clears token, role, QueryClient, booking drafts, concierge, review flags. Tests in `tests/unit/end-session.test.ts` |
| BUG-003 | P1 booking API 500 | **Mitigated.** Confirm goes through WhatsApp until backend catalog IDs exist | `shouldPostBookingToApi()` defaults false |
| BUG-004 | P1 guest 401 logout | **Fixed** | 401 ends session only when a Bearer token was sent; login/register never send a token |
| BUG-005 | P1 no fetch timeout | **Fixed** | 15s abort; test `times out hung requests` |
| BUG-006 | P1 OAuth token in query | **Partial.** Prefers `code` + `/api/auth/oauth/exchange` and hash tokens. Query-string token is last-resort if the backend still returns one | `parseOAuthRedirect` tests |
| BUG-007 | P1 debug release signing | **Local Gradle fixed** if `credentials/android/keystore.properties` exists. `android/` is gitignored — EAS production uses `credentialsSource: remote` | `eas.json`, local `build.gradle` |
| BUG-008 | P1 anonymous IDs | **Fixed in config** to `com.siamez.app` | `app.json` |
| BUG-009 | P1 no EAS | **Partial.** `eas.json` added. **No Expo `projectId` yet** — run `eas init` on an Expo account | Push still needs projectId |
| BUG-010 | P1 tsc crash | **Fixed.** Caused by `allowJs` compiling `dist-demo`. `tsconfig` now excludes `dist` / `dist-demo` / `coverage` / `portfolio` | `tsc` completes |
| BUG-011 | P1 generic privacy strings | **Fixed in `app.json` + local Info.plist / PrivacyInfo** | Specific camera/photo/mic/speech/location copy; collected types declared |
| BUG-012 | P1 fake payments UI | **Hidden** pending-invoice metric and Profile Payments / payment-reminder toggles | Dashboard / Profile |
| BUG-013 | P1 documents | **Improved.** Guest upload blocked; type/size limits; Open uses `url`/`downloadUrl` or `/api/documents/:id/url` | Upload rules tests |
| BUG-015 | P2 API URL in login alert | **Fixed** while editing login | Login alert is the server message only |
| BUG-018 | P2 unauthenticated private queries | **Fixed** | `useSessionQueryEnabled()` on cases/documents/dashboard/invoices/goals/etc. |
| BUG-020 | P2 allowBackup / overlay | **Partial.** Local manifest `allowBackup=false`; `SYSTEM_ALERT_WINDOW` blocked in `app.json`. Regenerated native projects still needed for git-based EAS builds | |

### Phase 1 launch recommendation (historical)

**⚠️ LAUNCH AFTER FIXING REMAINING OPS/P1**

Safe for **internal** builds after:

1. **Rotate/disable** the production `freelancer@example.com` password (the value is still in git history / the public repo’s past commits).
2. `eas init` and set Expo projectId for push.
3. `npx expo prebuild --clean` so committed-config identity and permissions land in store binaries (native folders are gitignored).
4. Device QA of logout (account A → B) and guest booking via WhatsApp.

Not yet safe for a public store launch: OAuth may still return a token in the URL from the **backend**; in-app API booking is disabled; TypeScript still has unrelated errors; no device pass.

### Phase 1 launch score (historical)

**61/100** (was 46/100)

| Area | Before | After |
| ---- | ------ | ----- |
| Stability | 52 | 64 |
| Authentication | 64 | 72 |
| Security | 32 | 58 |
| API reliability | 55 | 68 |
| Booking | 22 | 48 |
| Cases | 68 | 72 |
| Documents | 48 | 62 |
| Payments | 18 | 28 |
| Navigation | 70 | 70 |
| UI/UX | 66 | 68 |
| Accessibility | 44 | 46 |
| Performance | 58 | 62 |
| iOS readiness | 36 | 58 |
| Android readiness | 34 | 56 |
| Testing | 40 | 58 |
| Production configuration | 30 | 52 |

---

**Method (original audit):** Architecture review, static code inspection, Vitest, TypeScript, Expo Doctor, npm audit, live production API probing (`https://siam-e-zweb-ng.vercel.app`), and native project inspection (`ios/`, `android/`).  

**Not executed in this environment:**
- iOS Simulator run — Xcode 26.2 is installed; a full `expo run:ios` / Simulator session was **not** performed. `NOT TESTABLE IN CURRENT ENVIRONMENT` for device/simulator UX, permissions dialogs, and native crashes.
- Android Emulator / device run — `ANDROID_HOME` is unset. `NOT TESTABLE IN CURRENT ENVIRONMENT`.
- Playwright E2E — config rebuilds a full web export (~4 minutes). Not run in this pass. Existing spec only asserts that a login URL is reachable.
- App Store Connect / Play Console submission dry-run.

Native iOS/Android conclusions below are from **source, generated native projects, and API evidence**, not from a booted simulator.

---

## Executive Summary

SiamEZ is a real product surface: Expo Router tabs, SecureStore session tokens, a production backend, marketplace listings, concierge chat, freelancer jobs, and a booking wizard. Several subsystems are genuinely built (auth, cases list, documents list, dashboard overview, vehicles/property feeds).

**After Phase 1 code fixes:** demo credentials are gone from current source, logout wipes user-scoped cache/PII, guests are not logged out by anonymous 401s, API calls time out, booking confirm uses WhatsApp until the backend accepts catalog slugs, and store identity/privacy strings are no longer placeholders.

**Still blocking a public launch:** the production demo **password must be rotated** (it authenticated on 13 Aug 2026 and may remain in git history), EAS projectId is unset, OAuth backend may still put tokens in URLs, and no device/simulator pass was run.

---

## Launch Recommendation

**⚠️ LAUNCH AFTER FIXING REMAINING OPS/P1**

Do not ship a public store build until:

1. Production demo account rotated / disabled; git history treated as compromised for that password.
2. `eas init` + push `projectId`.
3. Fresh prebuild and a real-device logout / guest-booking pass.
4. Backend booking catalog IDs **or** keep WhatsApp as the documented launch booking path.

Until those land: **internal builds only**.

---

## Launch Score

**61/100**

See the re-audit table above for per-area scores. Original afternoon scores are preserved in git history of this file’s first version.


---

## Critical Issues

### BUG-001 — Production demo freelancer account is live and in a public repo

**Severity:** P0  
**Category:** Security  
**Status:** Confirmed  
**Location:** `app/(auth)/login.tsx` (`DEMO_FREELANCER_EMAIL`, `DEMO_FREELANCER_PASSWORD`)  
**Affected Platform:** Both (credential is server-side; source is public)

**Description:**  
The login screen contains a hardcoded freelancer email and password. The demo UI is wrapped in `__DEV__`, so a production binary may not show the hint. The constants and values remain in the public GitHub repository. A `POST /api/auth/login` to production with those values returned **HTTP 200**, a JWT, and user `{ email, name, role: "freelancer" }`.

**Steps to Reproduce:**

1. Open `app/(auth)/login.tsx` in the public repository.
2. `POST https://siam-e-zweb-ng.vercel.app/api/auth/login` with the hardcoded email/password.
3. Observe `success: true` and a Bearer token.
4. `GET /api/auth/me` and `GET /api/freelancer/dashboard` succeed with that token.

**Expected Behavior:**  
No production account password in source control. Demo accounts exist only in non-production environments, or are disabled before launch.

**Actual Behavior:**  
Anyone who can read the repo can log into a real freelancer account on production and access that account’s jobs, profile, and marketplace engagement.

**Evidence:**  
Live login against production on 13 Aug 2026 returned 200. Follow-up authenticated GETs for `/api/auth/me`, `/api/freelancer/me`, `/api/freelancer/jobs`, and `/api/freelancer/dashboard` succeeded. GitHub repo page is publicly reachable.

**Root Cause:**  
Dev convenience credentials were pointed at the production API and committed. The account was never rotated.

**Recommended Fix:**

1. **SECRET FOUND — ROTATION REQUIRED** at `app/(auth)/login.tsx`. Disable or rotate the production password immediately. Review sessions/JWTs for that user.
2. Remove credentials from source. If a demo is required, use a staging API and env-only secrets that are not committed.
3. Rewrite git history or accept that the old password is public forever (rotation is still mandatory).
4. Confirm the production binary does not embed the password (Metro `__DEV__` DCE is not a substitute for rotation).

**Regression Test:**  
CI smoke that production login with the old demo pair returns 401. Secret scanning in CI.

---

### BUG-002 — Logout does not clear user data; next account can see previous user’s data

**Severity:** P0  
**Category:** Security / Privacy  
**Status:** Confirmed (code + architecture; device cross-login `NOT TESTABLE IN CURRENT ENVIRONMENT`)  
**Location:**  
- `hooks/use-auth.ts` (`logout`)  
- `components/providers/app-providers.tsx` (QueryClient, `staleTime: 20_000`)  
- `app/(tabs)/book.tsx` (AsyncStorage drafts)  
- `features/concierge/concierge.api.ts` (`@siamez/concierge-journey/v1`)  
- `lib/jobs/review-storage.ts`

**Affected Platform:** Both

**Description:**  
`logout()` only clears the JWT and role from SecureStore and the Zustand session. It does **not**:

- `queryClient.clear()` / `removeQueries`
- delete `@booking-draft:*` keys (name, email, phone, notes)
- delete concierge journey
- delete job review flags

Authenticated queries (`useCases`, `useDocuments`, `useInvoices`, `useDashboard`, `useGoals`) use global keys such as `['my-cases']` with **no user id** and **no `enabled: Boolean(accessToken)`**. After User B logs in, React Query can immediately render User A’s cached cases/invoices/documents for up to `staleTime` (20s) and longer if a refetch is slow.

**Steps to Reproduce:**

1. Log in as User A, open Dashboard / Cases / Documents.
2. Log out.
3. Log in as User B on the same app process (no OS kill).
4. Open Cases / Documents / Dashboard.

**Expected Behavior:**  
No User A records, drafts, or chat/journey state are visible. Queries are disabled until a new session exists, and cache is empty.

**Actual Behavior:**  
In-memory React Query cache and AsyncStorage PII survive logout. Zustand session is cleared; everything else is not.

**Evidence:**  
`logout` in `hooks/use-auth.ts` only calls `clearAccessToken`, `clearUserRole`, `clearSession`. Grep found **zero** `queryClient.clear` / `removeQueries`. Booking drafts are written on every field change and only removed after a *successful* booking. `useCases` / `useDocuments` / `useInvoices` / `useDashboard` have no auth `enabled` flag.

**Root Cause:**  
Session teardown is token-only. Server-state and local drafts were never treated as user-scoped.

**Recommended Fix:**

1. On logout (and 401 teardown): `queryClient.clear()`, delete keys with prefix `@booking-draft:`, `@siamez/concierge-journey`, `@siamez/job-review/`.
2. Include `user.id` in query keys **or** `enabled: Boolean(accessToken) && !isGuest`.
3. Do not persist booking PII in AsyncStorage, or encrypt and bind it to user id, and always wipe on logout.

**Regression Test:**  
Unit/integration test: seed QueryClient with `['my-cases']` data, call logout helper, assert cache empty. Test booking-draft keys removed.

---

## High Priority Issues

### BUG-003 — Booking submit fails against production for all mobile catalog slugs

**Severity:** P1  
**Category:** Bug / API  
**Status:** Confirmed  
**Location:** `features/bookings/bookings.api.ts`; slugs in `features/services/services.data.ts`; wizard `app/(tabs)/book.tsx`  
**Affected Platform:** Both

**Description:**  
The app posts `serviceId: selectedService.slug` to `POST /api/bookings`. Production accepts the route (empty body → 400 `serviceId is required`) but rejects catalog slugs with **HTTP 500** `Service not found or inactive`.

Slugs tested: `translation-services`, `marriage-registration`, `visa-services`, `driver-license`, plus a nonsense slug. All 500.

**Steps to Reproduce:**

1. Complete the booking wizard for any catalog service.
2. Tap Confirm & submit.
3. Or: `POST /api/bookings` with `{ "serviceId": "translation-services", "guestName": "...", "guestEmail": "...", "guestPhone": "..." }`.

**Expected Behavior:**  
Valid catalog services create a booking (201/200) or return 400 with a field error. Unknown slugs should be 400, not 500.

**Actual Behavior:**  
Submit fails. User sees an alert. WhatsApp/contact links still work.

**Evidence:**  
Live API, 13 Aug 2026, authenticated and unauthenticated.

**Root Cause:**  
Mobile catalog is a local static list. Backend service records use different ids/slugs, or those services are inactive. There is no `GET /api/services` catalog on the backend (404).

**Recommended Fix:**  
Drive booking from the live service catalog (or a documented id map). Do not submit slugs the API does not recognize. Treat 500 as a launch blocker for in-app booking. Align HTTP status for unknown service to 400.

**Regression Test:**  
Contract test: each launch slug `POST /api/bookings` does not return “Service not found”. Staging-only; do not create production bookings from CI.

---

### BUG-004 — Any HTTP 401 logs the user out, including guests mid-booking

**Severity:** P1  
**Category:** Bug / Auth  
**Status:** Confirmed  
**Location:** `lib/api.ts` (`logoutForUnauthorized`, called on every 401); `app/(tabs)/book.tsx` upload; `POST /api/documents/upload`  
**Affected Platform:** Both

**Description:**  
`request()` calls `logoutForUnauthorized()` on **every** 401, which sets `isGuest: false`. Guest booking offers file/camera upload. `POST /api/documents/upload` returns **401 Unauthorized** without a token. That 401 clears guest mode; root layout then treats the user as logged out and `replace`s to login. Booking in progress is interrupted (draft may remain in AsyncStorage — see BUG-002).

Failed email login is also 401, which is fine on the login screen, but the same global handler is unsafe for public/guest calls.

**Steps to Reproduce:**

1. Continue as Guest → Book a service → step 2 → Upload file.
2. Upload hits `/api/documents/upload` → 401.
3. Session `isGuest` becomes false → redirect to login.

**Expected Behavior:**  
Guest stays in guest mode. Upload shows “sign in to attach files” or queues locally. 401 on login does not have to call `clearSession` for guests.

**Actual Behavior:**  
Guest session is destroyed. User is kicked to login.

**Evidence:**  
`POST /api/documents/upload` without token → 401. `lib/api.ts` lines 151–155 always logout. `clearSession` sets `isGuest: false`.

**Recommended Fix:**  
Only logout on 401 when a token was sent. Never send guest uploads to an auth-only endpoint without handling 401 locally. Skip global logout for `/api/auth/login`.

**Regression Test:**  
`api.post` 401 with no token must not call `clearSession`. Guest flag remains true.

---

### BUG-005 — Primary API client has no timeout

**Severity:** P1  
**Category:** Performance / Reliability  
**Status:** Confirmed  
**Location:** `lib/api.ts` (`fetch` with no `AbortSignal`); contrast `lib/api/client.ts` axios `timeout: 15000` (unused)  
**Affected Platform:** Both

**Description:**  
All real API traffic uses `fetch` in `lib/api.ts`. There is no timeout. A hung TCP connection can leave buttons in `isPending` indefinitely (`bookingMutation.isPending` disables submit). Axios `apiClient` has a 15s timeout but is **not imported anywhere**.

**Steps to Reproduce:**  
Call any endpoint against a black hole / extremely slow network. Observe no client-side abort.

**Expected Behavior:**  
Requests abort after ~15s with a user-visible retry.

**Actual Behavior:**  
Can hang until OS kills the socket. Loading/disabled states may never clear.

**Evidence:**  
Grep for `AbortController` / `timeout` in `lib/` only finds axios timeout on the unused client.

**Recommended Fix:**  
Add `AbortSignal.timeout(15000)` (or equivalent) to `fetch`. Delete or actually use `lib/api/client.ts` — do not keep two clients.

**Regression Test:**  
Mock fetch that never resolves; assert `ApiError` after timeout.

---

### BUG-006 — OAuth access token is passed in the redirect URL query string

**Severity:** P1  
**Category:** Security  
**Status:** Confirmed  
**Location:** `hooks/use-auth.ts` (`loginWithProvider`)  
**Affected Platform:** Both

**Description:**  
Google/Facebook/LINE complete by opening `${webBaseUrl}/auth/${provider}?redirect_uri=...` then reading `accessToken` from `result.url` search params. Tokens in URLs are logged by proxies, referrers, OS, and crash reporters.

**Expected Behavior:**  
Authorization code + PKCE, or a one-time fragment/session exchange that never puts a long-lived JWT in a query string.

**Actual Behavior:**  
JWT (or access token) is a query parameter on the custom-scheme URL.

**Evidence:**  
```73:79:hooks/use-auth.ts
      if (result.type === 'success' && result.url) {
        const parsedUrl = new URL(result.url);
        const token = parsedUrl.searchParams.get('accessToken');
        if (token) {
          const user = await getMe(token);
```

**Recommended Fix:**  
Switch to auth-code flow. If a short-lived token must return via deep link, use a one-time code exchanged server-side.

**Regression Test:**  
Provider login test asserts token is not taken from `searchParams` once the new flow exists.

---

### BUG-007 — Android release builds are signed with the debug keystore

**Severity:** P1  
**Category:** Build / Security  
**Status:** Confirmed (local `android/` project; gitignored — EAS prebuild may differ)  
**Location:** `android/app/build.gradle`  
**Affected Platform:** Android

**Description:**  
`buildTypes.release.signingConfig` is `signingConfigs.debug`. Play Store will reject (or you will ship an insecure, non-updatable signing identity). A release keystore exists at `credentials/android/siamez-release.keystore` (gitignored) but Gradle does not reference `keystore.properties`.

**Expected Behavior:**  
Release signed with the upload/app signing key. Debug keystore never used for Play.

**Actual Behavior:**  
Local `expo run:android` / Gradle release uses debug signing. Comment in Gradle even says to generate your own keystore.

**Evidence:**  
`android/app/build.gradle` `signingConfig signingConfigs.debug` under `release`.

**Recommended Fix:**  
Wire `credentials/android/keystore.properties` into `signingConfigs.release`, or use EAS credentials. Never commit the keystore. Confirm Play App Signing.

**Regression Test:**  
CI that fails if release `signingConfig` is debug.

---

### BUG-008 — Store identifiers are still `com.anonymous.SiamEZappNG`

**Severity:** P1  
**Category:** Build / Release  
**Status:** Confirmed  
**Location:** `app.json` `ios.bundleIdentifier`, `android.package`; `android/app/build.gradle` `applicationId` / `namespace`  
**Affected Platform:** Both

**Description:**  
Expo’s placeholder identity is still in use. Changing this after first store submission is painful. `com.anonymous.*` is not an acceptable production ID.

**Recommended Fix:**  
Choose `com.siamez.app` (or owned domain reverse-DNS) **before** first TestFlight/Play upload. Update associated domains, OAuth redirect URIs, and Firebase/Expo project if any.

---

### BUG-009 — No EAS project, no push projectId, OTA metadata inconsistent

**Severity:** P1  
**Category:** Build / Notifications  
**Status:** Confirmed  
**Location:** missing `eas.json`; `app.json` `updates`; `services/notificationService.ts`; `android/.../AndroidManifest.xml`  
**Affected Platform:** Both

**Description:**

- No `eas.json`.
- `getExpoPushTokenAsync` uses `Constants.expoConfig?.extra?.eas?.projectId` — not configured in `app.json`.
- `app.json` has `updates.enabled: true` and `checkAutomatically: NEVER`.
- Generated Android manifest: `expo.modules.updates.ENABLED=false` and `EXPO_UPDATES_CHECK_ON_LAUNCH=ALWAYS` — contradicts `app.json`.
- `useAutoUpdate` can prompt restart, but without a real EAS project OTA will not work.

**Recommended Fix:**  
`eas init`, set `extra.eas.projectId`, configure credentials, decide OTA policy, regenerate native projects (`npx expo prebuild --clean`) so manifests match.

---

### BUG-010 — `npm run typecheck` crashes (stack overflow)

**Severity:** P1  
**Category:** Build  
**Status:** Confirmed  
**Location:** `tsc --noEmit` (TypeScript 5.9.2)  
**Affected Platform:** Tooling (blocks CI quality gate)

**Description:**  
`npm run typecheck` throws `RangeError: Maximum call stack size exceeded` inside `resolveNameHelper`. AGENTS.md previously described ordinary type errors; the compiler now does not complete. There is no ESLint.

**Evidence:**  
Command run 13 Aug 2026, exit code 1, stack overflow in `typescript/lib/_tsc.js`.

**Recommended Fix:**  
Isolate the cyclic type (often RN/Gifted Chat / Expo types). Pin a TS version that completes. Add `tsc` to CI only after it exits cleanly. Add ESLint.

---

### BUG-011 — iOS privacy manifest declares no collected data; usage strings are generic

**Severity:** P1  
**Category:** Privacy / App Store  
**Status:** Confirmed  
**Location:** `ios/SiamEZ/PrivacyInfo.xcprivacy`; `ios/SiamEZ/Info.plist`  
**Affected Platform:** iOS

**Description:**

- `NSPrivacyCollectedDataTypes` is an **empty array**. The app collects email, name, phone, documents, location (tracking), microphone (voice search), photos/camera, and push tokens.
- Camera/mic/photo strings are generic: `Allow $(PRODUCT_NAME) to access your camera` — a common App Review rejection.
- `app.json` declares `NSLocationWhenInUseUsageDescription`, but the **generated** `Info.plist` has **no** location usage string. Speech recognition is used (`hooks/use-voice-search.ts`) with no `NSSpeechRecognitionUsageDescription` in the generated plist.
- Generated `ios/` / `android/` are gitignored; EAS prebuild from `app.json` may differ, but local device builds will crash/fail permission prompts for location/speech.

**Recommended Fix:**  
Fill App Privacy + `PrivacyInfo.xcprivacy` to match actual collection. Replace generic usage strings with specific SiamEZ purposes. Run `expo prebuild --clean` so plugins emit location, speech, camera, and photo keys. Keep native folders in sync with `app.json`.

---

### BUG-012 — Payments/invoices have API hooks but no customer payment flow

**Severity:** P1  
**Category:** Missing functionality / API  
**Status:** Confirmed  
**Location:** `hooks/use-invoices.ts`, `features/payments/*`, `hooks/use-submit-payment.ts` (unused), `app/(tabs)/dashboard.tsx`  
**Affected Platform:** Both

**Description:**  
`GET /api/invoices` exists (401 unauth, 200 empty array for the demo freelancer). Dashboard only shows a pending-invoice **count**. `submitPayment` posts to `/api/payments` but **no screen imports `useSubmitPayment`**. There is no payment-proof upload UI. Profile “Payment reminders” switches are local React state and do not call the backend.

**Expected Behavior:**  
Customers can view invoices, amounts/currency, status, and submit proof or pay.

**Actual Behavior:**  
Financial surface is a number on Dashboard. Client-side amount formatting exists for jobs (`formatJobAmount` satang) but invoices are not rendered.

**Recommended Fix:**  
If payments are in-scope for launch, ship invoice list + proof upload + server-authoritative amounts. If not, hide pending-invoice metrics and reminder toggles so the product does not imply a broken pay flow.

---

### BUG-013 — Documents cannot be previewed or downloaded; uploads have no type/size limits

**Severity:** P1  
**Category:** Missing functionality / UX  
**Status:** Confirmed  
**Location:** `app/(tabs)/documents.tsx`; `features/documents/documents.api.ts`  
**Affected Platform:** Both

**Description:**  
The documents screen lists `name`, `type`, `uploadedAt`, `status` only. No open/share/download. Upload uses FormData `as any` with default MIME `application/octet-stream`. No client max size, no allow-list (PDF/JPEG). Guest upload is impossible (BUG-004).

**Recommended Fix:**  
Add authenticated download/preview via backend-signed URLs (never a world-readable URL). Validate type/size before upload. Disable upload for guests or require login first.

---

## Medium Priority Issues

### BUG-014 — Login and signup skip client-side validation

**Severity:** P2  
**Category:** UX / Forms  
**Status:** Confirmed  
**Location:** `app/(auth)/login.tsx`, `app/(auth)/signup.tsx`

Empty login → API 400 `Email and password are required`. Invalid register email → 400 `Invalid email`. Short password → 400 `Password must be at least 8 characters`. No trim/format checks before submit except what `auth.api.ts` does for email lowercase. Booking step 1 requires non-empty email/phone but **not** a valid email pattern.

---

### BUG-015 — Failed login alert leaks internal API base URL

**Severity:** P2  
**Category:** Security / UX  
**Status:** Confirmed  
**Location:** `app/(auth)/login.tsx` `handleLogin`

The alert includes `API: ${appConfig.apiUrl}`. Customers should not see infrastructure URLs. Attackers get a confirmed target.

---

### BUG-016 — Notification and account settings are non-functional

**Severity:** P2  
**Category:** UX  
**Status:** Confirmed  
**Location:** `app/(tabs)/profile.tsx`

Push / case / payment / document switches are `useState` only. Edit profile, change email, change password are `Alert` “coming soon.” Users will believe settings persist.

---

### BUG-017 — Dashboard treats partial API failure as success

**Severity:** P2  
**Category:** Bug  
**Status:** Confirmed  
**Location:** `app/(tabs)/dashboard.tsx`

`isLoading` uses AND across queries; `isError` requires **all three** of overview, cases, and invoices to fail. One broken endpoint yields zeros / empty recommendations with no error. Soft-launch dashboard also fires `useGoals` / `useLifeEvents` even when those areas are hidden.

---

### BUG-018 — Authenticated React Query hooks fire without a token

**Severity:** P2  
**Category:** API / Auth  
**Status:** Confirmed  
**Location:** `hooks/use-cases.ts`, `use-documents.ts`, `use-invoices.ts`, `use-dashboard.ts`, `use-goals.ts`

Unlike `use-my-freelancer-profile.ts`, these queries always run. Combined with BUG-004, a 401 on a screen that briefly mounts will log the user out. Combined with BUG-002, cache keys collide across users.

---

### BUG-019 — Dual API clients and dead `/auth/*` fallbacks

**Severity:** P2  
**Category:** API  
**Status:** Confirmed  

- Production routes are `/api/auth/login`, `/api/auth/me`, `/api/cases`, `/api/dashboard/overview`.  
- `/auth/login` and `/auth/me` return **HTML 404**. `auth.api.ts` still tries them after 404, adding latency and parsing HTML error pages.  
- README still documents `/client/cases` and `/client/dashboard/overview` — those 404.  
- `lib/api/client.ts` (axios) is unused. `npm audit` reports a **high** axios advisory; it should not remain if unused.

---

### BUG-020 — Android `allowBackup=true` and `SYSTEM_ALERT_WINDOW`

**Severity:** P2  
**Category:** Security  
**Status:** Confirmed  
**Location:** `android/app/src/main/AndroidManifest.xml`

Backup can extract AsyncStorage PII (booking drafts). `SYSTEM_ALERT_WINDOW` is a Play policy red flag (often from Expo debug overlay). Disable backup or exclude sensitive files; remove the overlay permission from release.

---

### BUG-021 — `enableScreens(false)` globally

**Severity:** P2  
**Category:** Performance  
**Status:** Confirmed  
**Location:** `app/_layout.tsx`

Comment cites an Android Fabric mount race. This disables native screen optimization on **both** platforms and increases memory during navigation. Revisit with a targeted Android workaround.

---

### BUG-022 — Dark theme vs forced light system UI

**Severity:** P2  
**Category:** UX  
**Status:** Confirmed  
**Location:** `app.json` `userInterfaceStyle: "light"`; `ios/.../Info.plist` `UIUserInterfaceStyle = Light`; in-app `ThemePicker`

Users can pick dark/night in Profile, but the OS/status bar/system chrome stay light. NativeWind `darkMode` is not aligned with Zustand theme (AGENTS.md already notes a web warning).

---

### BUG-023 — Hardcoded English on several launch screens

**Severity:** P2  
**Category:** Internationalization  
**Status:** Confirmed  

`en.json` / `th.json` have **940 matching keys** (good). But Dashboard, More, Profile, and signup still contain hardcoded English (“Signed in as”, “Quick links”, “This feature will be available soon.”, “Ask SiamEZ”, etc.). Thai users will see mixed language. `i18n.enableFallback = true` hides missing keys as English rather than failing tests.

---

### BUG-024 — Dates use device locale, not Asia/Bangkok

**Severity:** P2  
**Category:** Date / timezone  
**Status:** Confirmed  
**Location:** `app/(tabs)/cases.tsx`, `documents.tsx` (`toLocaleDateString()` with no timeZone)

A customer in the US can see the previous calendar day for a Bangkok `YYYY-MM-DD` / UTC timestamp. Booking has **no appointment date/time picker** at all (requirements + notes only) — if operations expect a slot, that is missing functionality (P4 if WhatsApp handles scheduling).

---

### BUG-025 — Push registration and notification privacy

**Severity:** P2  
**Category:** Notifications  
**Status:** Confirmed  
**Location:** `hooks/use-push-notifications.ts`, `services/notificationService.ts`

Foreground handler shows alerts with server-provided title/body (sensitive case text could appear on lock screen — server-controlled). Tap navigates to job chat by `jobId` in payload with **no check that the job belongs to the current user** (IDOR depends entirely on API). Logout does not unregister the push token. No EAS projectId (BUG-009) so registration likely fails in production.

---

### BUG-026 — Expo SDK patch drift

**Severity:** P2  
**Category:** Dependencies  
**Status:** Confirmed  

`npx expo-doctor`: **18/19 passed**, 22 packages behind SDK 55 expected patches (`expo` 55.0.18 vs ~55.0.28, `react-native` 0.83.6 vs 0.83.10, etc.). `npm audit --omit=dev`: **27** issues (1 critical `shell-quote`, 18 high including `axios`, `ws`, `form-data`, `react-native`). Do not mass-upgrade; apply `npx expo install --fix` for SDK alignment and review runtime advisories (`axios`/`ws`/`form-data`) separately.

---

### BUG-027 — Case detail is a stub; invalid `updatedAt` renders “Invalid Date”

**Severity:** P2  
**Category:** UX / Missing functionality  
**Status:** Confirmed  
**Location:** `app/cases/[id].tsx`, `app/(tabs)/cases.tsx`

No timeline, notes, assigned staff, or case documents. Tracking button always routes to `/client/tracking/${id}` even when the case has no job. `new Date(item.updatedAt)` is unguarded.

Live `GET /api/cases` for the demo freelancer returned `[]` (empty state path is implemented).

---

## Low Priority Issues

### BUG-028 — README and architecture docs are stale

**Severity:** P3  
**Category:** Docs  
**Status:** Confirmed  

README lists tabs `home/cases/book/documents/profile` and endpoints `/client/cases`. Actual soft-launch IA is Services / Vehicles / Real Estate / Concierge / More, plus freelancer and corporate portals. Env key is `EXPO_PUBLIC_API_URL` without a trailing `/api` (paths already include `/api/...`).

---

### BUG-029 — Shared `Button` is not an accessibility button

**Severity:** P3  
**Category:** Accessibility  
**Status:** Confirmed  
**Location:** `components/ui/Button.tsx`

`Pressable` has no `accessibilityRole="button"` and no `accessibilityLabel` (relies on visible `Text`). Icon-only controls elsewhere are mixed. Tab icons have no selected-state announcement beyond label. Minimum heights on `Button` are 48–52 (good); some `RowItem` chevrons and tab icons may be tight.

---

### BUG-030 — Trust stats are hardcoded marketing numbers

**Severity:** P3  
**Category:** UX  
**Status:** Confirmed  
**Location:** `components/ui/TrustStats.tsx` — `1000+`, `10+`, `100%` success. App Review may challenge unsubstantiated 100% claims.

---

### BUG-031 — `.env` is committed; `.gitignore` ignores only `.env*.local`

**Severity:** P3  
**Category:** Configuration  
**Status:** Confirmed  

Current `.env` contains only public `EXPO_PUBLIC_*` URLs (not a secret). The pattern will eventually leak a secret. Ignore `.env`; keep `.env.example`.

---

### BUG-032 — `unwrapApiData` unwraps any object with a `data` property

**Severity:** P3  
**Category:** API  
**Status:** Potential  

If a payload is `{ data: T, success }` this is correct. If a domain object itself has `data`, it would be unwrapped incorrectly. Prefer `success === true` before unwrapping.

---

## Security Findings

| ID | Finding | Severity |
| -- | ------- | -------- |
| BUG-001 | **SECRET FOUND — ROTATION REQUIRED** — live production demo password in public repo `app/(auth)/login.tsx` | P0 |
| BUG-002 | Cross-account data via QueryClient + AsyncStorage after logout | P0 |
| BUG-006 | OAuth token in URL query | P1 |
| BUG-007 | Android release signed with debug keystore (local native project) | P1 |
| BUG-004 | 401 handler is a session-reset sledgehammer | P1 |
| BUG-015 | Login errors expose API URL | P2 |
| BUG-020 | `allowBackup=true`, `SYSTEM_ALERT_WINDOW` | P2 |
| — | JWT stored in `expo-secure-store` (`siamez_jwt`) — **correct** on iOS/Android; web has no SecureStore (session memory-only, documented) | OK |
| — | Tokens not logged in `console.*` (grep clean) | OK |
| — | API is HTTPS only; ATS `NSAllowsArbitraryLoads=false` | OK |
| — | Authorization is not enforced only on the client for cases/documents (API 401 without token) — good. IDOR still **server-dependent**; client will request `/api/cases/:id` for any id | Residual |
| — | Local `credentials/android/keystore.properties` exists and is gitignored (keys not printed). Confirm it was never committed historically | Residual |
| — | `EXPO_PUBLIC_PUSHER_KEY` empty — realtime chat/tracking silently disabled unless the backend sends keys in chat config | Residual |

No other committed secrets were found in `.env` (public URLs only). **Do not treat that as a full git-history secret scan.**

---

## Performance Findings

- `enableScreens(false)` — BUG-021.
- Cases/documents are unpaginated `FlatList` / `ScrollView` maps. Fine for small N; no cap if a customer accumulates years of files.
- Query `staleTime: 20_000` reduces refetch but causes BUG-002.
- `lib/api.ts` has no timeout — BUG-005. Retry is React Query `retry: 1` only for queries, not mutations.
- Launch animation fallback 4s/8s plus a full intro video asset (`assets/launch-intro.mp4` ~5.2 MB) — first-launch weight on low-end Android.
- Dev web bundle ~13 MB (AGENTS.md); not a store issue.
- `useFonts` invoked twice in `app/_layout.tsx` (Geist discarded return, then icon fonts).

---

## UX Findings

- Soft launch (`soft_launch: true` from live `/api/v1/feature-flags`) correctly focuses Services / Vehicles / RE / Concierge. Book tab is hidden but **More → Book a service** still opens the broken wizard.
- Guest flow exists and is a first-class path; document upload on that path is hostile (BUG-004).
- Booking confirmation can send guests to signup — good — but submit never succeeds (BUG-003).
- Profile/More mixed language; fake settings (BUG-016, BUG-023).
- Keyboard: booking uses `automaticallyAdjustKeyboardInsets`; Android `softwareKeyboardLayoutMode: resize`. Simulator verification `NOT TESTABLE IN CURRENT ENVIRONMENT`.
- `Button` press scale animation is fine; disabled opacity 0.6 without announcing busy state except booking submit label change.

---

## API Findings

Live production (`https://siam-e-zweb-ng.vercel.app`), 13 Aug 2026:

| Method | Path | Unauthenticated | Authenticated (demo freelancer) |
| ------ | ---- | --------------- | -------------------------------- |
| GET | `/api/v1/feature-flags` | 200 `soft_launch: true` | 200 |
| POST | `/api/auth/login` | 400 empty; 401 bad password; **200 demo pair** | — |
| GET | `/api/auth/me` | 401 | 200 |
| GET | `/auth/me` | 404 HTML | — |
| GET | `/api/cases` | 401 | 200 `[]` |
| GET | `/api/client/cases` | 404 | 404 |
| GET | `/api/dashboard/overview` | 401 | 200 `{activeCases:0,...}` |
| GET | `/api/documents` | 401 | 200 `[]` |
| GET | `/api/invoices` | 401 | 200 `[]` |
| POST | `/api/bookings` | 400 missing serviceId; **500 unknown slug** | **500 unknown slug** |
| POST | `/api/documents/upload` | 401 | not write-tested |
| POST | `/api/payments` | 401 | not write-tested |
| POST | `/api/v1/concierge/chat` | 200 | — |
| GET | `/api/v1/marketplace/vehicles` | 200 | — |
| GET | `/api/v1/marketplace/properties` | 200 | — |
| GET | `/api/freelancer/dashboard` | 401 | 200 |
| GET | `/api/notifications` | 404 | 404 |
| POST | `/api/users/push-token` | 401 | not write-tested |

Frontend assumptions that are **wrong vs live API:**

- README `/client/*` paths do not exist.
- Local service slugs are not backend service ids (BUG-003).
- `/api/notifications` does not exist (in-app notification center missing).
- Envelope `{ success, data }` is handled correctly by `unwrapApiData` for the endpoints above.

---

## iOS Findings

| Item | Status |
| ---- | ------ |
| Display name | SiamEZ |
| Bundle ID | `com.anonymous.SiamEZappNG` (P1) |
| Version / build | 1.0.0 / 1 |
| Orientation | Portrait (+ upside down); iPad allows landscape |
| Icons / splash | `assets/icon.png`, `splash-icon.png` present |
| Camera/mic/photo usage | Generic (P1 review risk) |
| Location / speech usage | Missing from generated Info.plist (P1 if shipping this folder) |
| Associated domains | In `app.json`; not observed in generated Info.plist |
| PrivacyInfo collected types | Empty (P1) |
| ATS | Arbitrary loads false — good |
| Encryption declaration | Not in repo (App Store Connect) |
| Simulator UX | `NOT TESTABLE IN CURRENT ENVIRONMENT` |
| Xcode | 26.2 present |

---

## Android Findings

| Item | Status |
| ---- | ------ |
| applicationId | `com.anonymous.SiamEZappNG` (P1) |
| versionName / versionCode | 1.0.0 / 1 |
| Release signing | **Debug keystore** (P1) |
| INTERNET | Present |
| Location permissions | In `app.json`; **absent** from generated manifest |
| CAMERA | Not in generated manifest (camera booking/docs will fail on this project) |
| RECORD_AUDIO | Present (voice search) |
| POST_NOTIFICATIONS | Present |
| SYSTEM_ALERT_WINDOW | Present (P2) |
| allowBackup | true (P2) |
| Adaptive icon | Configured in `app.json` |
| Emulator | `NOT TESTABLE IN CURRENT ENVIRONMENT` (`ANDROID_HOME` empty) |

---

## Test Coverage Findings

| Area | Coverage | Verdict |
| ---- | -------- | ------- |
| Vitest | **15 files, 55 tests, all passed** (2.3s) | Good foundation, wrong emphasis |
| Auth API | Path fallback, trim email/password, envelope unwrap | No real 401-guest, no logout cache |
| Auth store | Zustand clearSession | Does not test storage or QueryClient |
| API client | URL join, 401 logout, FormData Content-Type, network error | No timeout test |
| Cases | ID encoding + unwrap | No empty/malformed list crash tests |
| Booking | **None** | Critical gap |
| Documents | **None** | Critical gap |
| Payments | **None** | Critical gap |
| Logout / user switch | **None** | P0 gap |
| Navigation / deep links | **None** | Gap |
| i18n | Key parity happens to be 940/940; no test | Fragile |
| E2E | `tests/e2e/auth-and-booking.spec.ts` only checks login URL loads | Name is misleading |
| Typecheck | Crashes | Cannot gate CI |
| ESLint | Not configured | Gap |
| Coverage thresholds | Configured only for a handful of files | Misleading if used as a launch metric |

---

## Build/Release Findings

- No `eas.json`, no EAS `projectId`.
- Expo Doctor: 1 failed check (SDK patch mismatch).
- `expo-updates` enabled in JS config, disabled in generated Android manifest.
- Native `ios/` and `android/` are gitignored and **stale vs `app.json`** (location, speech, intent filters, updates flags).
- `userInterfaceStyle: light` fights in-app dark mode.
- `.env` tracked; contains public URLs only.
- `credentials/android/siamez-release.keystore` exists locally and is gitignored — **not wired into Gradle**.
- No Fastlane / store metadata in repo.
- `npm audit` 27 production-tree advisories; many are Expo/Metro toolchain. Prioritize runtime (`ws`, `axios`, `form-data`) after SDK align.

---

## Missing Functionality

Relative to a concierge + cases + documents + payments mobile product:

1. Working in-app booking against live services.
2. Invoice list, pay, or payment-proof upload.
3. Document preview/download and guest-safe upload.
4. Case timeline / notes / staff (detail is a title + tracking button).
5. In-app notification center (`/api/notifications` 404).
6. Edit profile / change password / change email.
7. Persistent, server-backed notification preferences.
8. Push token lifecycle (register + unregister on logout) and EAS project.
9. Appointment date/time in booking (if operations need slots).
10. Production OAuth (token-in-URL is not shippable as-is).

Soft-launch **does** include working public marketplace reads and concierge chat (unauthenticated POST succeeded).

---

## Recommended Fix Order

1. **Rotate/disable** the production demo freelancer account. Remove credentials from the repo. Review active sessions.  
2. **Logout teardown:** clear QueryClient + booking drafts + concierge + review keys; auth-gate queries.  
3. **Stop 401-on-unauthenticated from clearing guest mode.** Disable guest document upload or require login.  
4. **Fix booking `serviceId` mapping** or hide Confirm & submit until the API accepts mobile slugs. Keep WhatsApp as backup, not the only working path if you advertise in-app booking.  
5. **Add fetch timeouts** and user-facing retry.  
6. **Replace OAuth query-string tokens.**  
7. **Production identity:** bundle/application ID, EAS project, Play/App Store signing (not debug), `prebuild --clean`.  
8. **App Privacy + usage strings + location/speech/camera permissions** aligned with actual behavior.  
9. **Payments:** ship or hide.  
10. **Documents preview** + type/size checks.  
11. **Typecheck + ESLint in CI.** Targeted tests for logout, 401-guest, booking contract.  
12. **P2/P3:** i18n leftovers, dashboard error logic, `enableScreens`, backup flag, README.

---

## Pre-Launch Checklist

**Blockers (must be true):**

- [ ] Production demo account rotated; password not in git
- [ ] Logout + 401 teardown wipes cache and local PII
- [ ] Guest 401 cannot force login mid-flow
- [ ] Booking submit succeeds for every service shown in the app **or** booking is removed from launch IA
- [ ] API client timeout + retry UX
- [ ] OAuth does not put JWTs in query strings
- [ ] Bundle ID / applicationId are owned, not `com.anonymous.*`
- [ ] Android release uses the real upload keystore (or EAS)
- [ ] EAS project ID present; push tokens actually register on a device
- [ ] iOS usage descriptions are specific; PrivacyInfo / App Privacy match data collection
- [ ] Location/camera/mic/speech/photo permissions present on a **fresh prebuild**
- [ ] `allowBackup` disabled or encrypted; no `SYSTEM_ALERT_WINDOW` in release
- [ ] Typecheck completes in CI
- [ ] Real-device pass: iPhone SE-class, current iPhone, small Android, large Android
- [ ] Account A → logout → account B shows zero A data
- [ ] Offline / airplane mode: no freeze, no duplicate booking submits
- [ ] Thai and English: no missing copy on login, services, booking, cases, profile
- [ ] Payments: implemented or hidden
- [ ] Documents: no cross-user files; preview uses auth’d URLs

**Store:**

- [ ] App Store encryption / privacy nutrition labels
- [ ] Play Data safety form
- [ ] Screenshots, age rating, support URL, privacy policy URL
- [ ] Production `EXPO_PUBLIC_API_URL` only (no staging)
- [ ] Disable `__DEV__` demo UI (already gated; verify release binary)

**Nice to have before 1.0:**

- [ ] ESLint
- [ ] Playwright covering login, guest book attempt, member cases empty/error
- [ ] Remove unused axios client
- [ ] Paginate cases/documents

---

## Critical Business Flow Matrix

| Flow | iOS | Android | API | Auth | Error Handling | Status |
| ---- | --- | ------- | --- | ---- | -------------- | ------ |
| App Launch | NOT TESTABLE | NOT TESTABLE | PASS (flags 200) | PARTIAL (bootstrap + SecureStore) | PARTIAL (launch fallback timer) | PARTIAL |
| Login | NOT TESTABLE | NOT TESTABLE | PASS | PASS (email); FAIL (demo secret); PARTIAL (OAuth) | PARTIAL (leaks API URL) | FAIL |
| Logout | NOT TESTABLE | NOT TESTABLE | N/A | FAIL (cache/drafts remain) | PARTIAL | FAIL |
| Dashboard | NOT TESTABLE | NOT TESTABLE | PASS | PARTIAL (no query `enabled`) | FAIL (AND error logic) | PARTIAL |
| Cases | NOT TESTABLE | NOT TESTABLE | PASS (empty list) | PASS (401 without token) | PASS (ErrorState) | PARTIAL |
| Case Details | NOT TESTABLE | NOT TESTABLE | PARTIAL (endpoint exists; thin UI) | PASS (redirect if guest) | PARTIAL | PARTIAL |
| Booking | NOT TESTABLE | NOT TESTABLE | FAIL (slug 500) | PARTIAL (guest allowed; upload 401) | PARTIAL (alert on fail) | FAIL |
| Documents | NOT TESTABLE | NOT TESTABLE | PARTIAL (list/upload; no download) | FAIL (guest upload 401) | PARTIAL | FAIL |
| Profile | NOT TESTABLE | NOT TESTABLE | N/A | PASS (session display) | FAIL (fake toggles) | PARTIAL |
| Notifications | NOT TESTABLE | NOT TESTABLE | FAIL (`/api/notifications` 404) | PARTIAL (push register likely fails without projectId) | PARTIAL | FAIL |
| Concierge | NOT TESTABLE | NOT TESTABLE | PASS | PASS (works logged out) | NOT TESTABLE | PARTIAL |
| Vehicles / RE | NOT TESTABLE | NOT TESTABLE | PASS | PASS (public GET) | NOT TESTABLE | PARTIAL |
| Payments | NOT TESTABLE | NOT TESTABLE | PARTIAL (GET invoices) | PASS (401) | FAIL (no UI) | FAIL |
| Freelancer portal | NOT TESTABLE | NOT TESTABLE | PASS (demo account) | FAIL (demo creds public) | NOT TESTABLE | PARTIAL |

---

## Environment and command log

| Command | Result | Blocks production? |
| ------- | ------ | ------------------ |
| `npm test` | **Pass** — 15 files, 55 tests | No |
| `npm run typecheck` | **Fail** — stack overflow | Yes for CI quality; not a runtime crash |
| ESLint | Not configured | No |
| `npx expo-doctor` | **18/19** — SDK patch mismatch | Should fix before store |
| `npm audit --omit=dev` | 27 vulns (1 critical, 18 high) | Review; not all runtime |
| `npm run ios` / Simulator | Not run (time); Xcode present | Device QA still required |
| `npm run android` | **Cannot run** — `ANDROID_HOME` unset | Device QA still required |
| `npm run test:e2e` | Not run (web export cost) | Existing E2E does not cover booking |
| Live API `fetch` | Run — see API Findings | Booking/auth secrets are blockers |

---

## Recommended Phase 1 Fixes

Only P0/P1:

1. Credential rotation + remove demo secrets (BUG-001).  
2. Logout/401 session teardown + query `enabled` (BUG-002, BUG-004, BUG-018).  
3. Booking service id alignment or hide submit (BUG-003).  
4. Fetch timeout (BUG-005).  
5. OAuth token transport (BUG-006).  
6. Bundle IDs, EAS, signing, prebuild, privacy strings (BUG-007–011).  
7. Payments: ship or hide (BUG-012).  
8. Documents: preview policy + guest upload (BUG-013).  
9. Restore `tsc` (BUG-010).  
10. Regression tests for logout cache, guest 401, booking contract.

Do **not** refactor navigation, NativeWind, or freelancer/corporate portals in this phase.

---

## Recommended Phase 2 Fixes

P2: validation, login error copy, fake settings, dashboard error logic, dead `/auth` fallbacks, unused axios, backup/overlay permission, `enableScreens`, dark mode vs `userInterfaceStyle`, i18n leftovers, Bangkok time zone, push unregister, Expo patch align, case detail richness.

---

## Recommended Phase 3 Improvements

P3/P4: README, Button a11y, TrustStats claims, `.env` gitignore, `unwrapApiData` strictness, pagination, appointment slots, ESLint, broader E2E, remove dead `apiClient`.

---

## Optional fix mode

Phase 1 (P0/P1 code) was implemented on 13 August 2026 evening. Remaining work is ops (password rotation, `eas init`), backend booking catalog IDs, OAuth code-exchange on the server, device QA, then P2/P3.

---

**LAUNCH STATUS: ⚠️ LAUNCH AFTER FIXING REMAINING OPS/P1**

App code no longer ships demo passwords, no longer leaks the previous user’s cache after logout, and no longer posts broken booking slugs. SiamEZ still cannot safely launch to real customers until the **production demo password is rotated**, an **EAS projectId** exists for push, and a **real-device** pass confirms logout and WhatsApp booking.

What already works: HTTPS API, SecureStore tokens on native, login/me/register validation on the server, public marketplace and concierge, empty-state cases/documents for an authenticated user, session teardown, API timeouts, and a coherent soft-launch IA.

