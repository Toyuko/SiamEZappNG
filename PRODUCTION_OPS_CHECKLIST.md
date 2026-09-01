# Production ops checklist (cannot be finished in app code alone)

Complete these before submitting store builds. App-side launch blockers from the pre-launch audit are addressed in code; the items below need Expo account / backend / device access.

## P0 — Security (do first)

1. **Rotate or disable** the production demo account previously used in the public repo (`freelancer@example.com`). Assume the password is compromised via git history.
2. Confirm no other seed/demo accounts accept known passwords against production.
3. Prefer OAuth **authorization code** exchange only; do not return JWT access tokens in redirect query strings.

## Release tooling

1. Log in to Expo: `npx eas-cli login`
2. Create/link the project: `npx eas-cli init` (writes `extra.eas.projectId` into `app.json`)
3. Fresh native projects for store binaries:
   ```bash
   npx expo prebuild --clean
   ```
   Confirm `android/app/build.gradle` uses `keystore.properties` for release, and iOS PrivacyInfo / usage strings match `app.json`.
4. Align remaining Expo patch versions when peer deps allow:
   ```bash
   npx expo install --fix -- --legacy-peer-deps
   ```

## Launch path (booking)

- The app uses the **standard website booking**: `POST /api/bookings` with the
  service slug + `formData` / `documentIds`.
- **Deploy the backend change** (`SiamEZwebNG` `src/app/api/bookings/route.ts`) so
  `/api/bookings` resolves slugs via `getOrEnsureServiceBySlug`. Without it,
  production still returns HTTP 500 for slug `serviceId`.
- Verify against production after deploy (guest + authenticated) — see QA below.

## Device QA (required once)

- [ ] Account A → logout → Account B: no prior cases/documents/drafts
- [ ] Guest booking creates a case and returns a case number + checkout token
- [ ] Authenticated booking creates a case bound to the signed-in user
- [ ] Guest document upload blocked with clear message
- [ ] Camera / photo library permission prompts show SiamEZ-specific copy
- [ ] OAuth login (if enabled) lands without token in the URL bar
- [ ] Push: register while logged in; after logout, token cleared server-side

## Store metadata

- Privacy policy URL and support contact in App Store Connect / Play Console
- Bundle IDs: `com.siamez.app` (already set in `app.json`)
