# SiamEZ App Audit & Redesign Plan

**Date:** 21 November 2026  
**Repo:** https://github.com/Toyuko/SiamEZappNG  
**Brand reference:** https://siam-ez.com/  
**Scope:** Full UI/UX redesign, booking conversion, and performance

---

## Current architecture

| Layer | Implementation |
| --- | --- |
| Framework | Expo SDK 55 + React Native 0.83 + TypeScript |
| Routing | `expo-router` (`app/`), role-gated tabs + stacks |
| State | Zustand (`auth`, theme, language, support, matching) |
| Data | TanStack Query + `lib/api.ts` → `https://siam-ez.com` |
| Styling | NativeWind 4 + `lib/theme/*` tokens + Geist font |
| Animation | `react-native-reanimated` 4 |
| Soft launch | Feature flags + `EXPO_PUBLIC_SOFT_LAUNCH` (default on) |

Entry is `expo-router/entry`. Root `App.tsx` / `index.ts` are dead boilerplate.

---

## Screen inventory (high level)

### Core conversion (KEEP / IMPROVE)
- `/(tabs)/home` — guest vs member home
- `/(tabs)/services` — featured carousel (to become searchable list)
- `/services/[slug]` — service detail + Book
- `/(tabs)/book` — 3-step booking wizard + guest checkout
- `/(tabs)/cases` + `/cases/[id]` + client tracking/chat — my bookings
- `/(tabs)/documents` — uploads
- `/(auth)/login|signup` — OAuth + guest
- `/(tabs)/profile` / `account` / `more` / `contact` / `concierge`

### Marketplace & portals (KEEP, demote in soft launch)
- Sales / real-estate listings + seller
- Freelancer directory, job board, tracking/chat
- Corporate Insights / Jobs / Ads / Profile

### Deferred / demo (INVESTIGATE — do not delete)
- Smart Match (`showSmartMatch: false`)
- Goals, life-events, workflows, saved
- Payments UI (API exists; UI intentionally hidden)

---

## Feature classification

### KEEP
- Guest + member booking (`POST /api/bookings`)
- Draft persistence, single-flight submit, guest checkout webview
- Auth (email, OAuth, guest), session bootstrap, SecureStore
- Cases, documents, push deep links to job chat
- Service catalog (static, web-aligned)
- Soft-launch gating, Chatwoot support host
- Freelancer / corporate portals (role-gated)

### IMPROVE
- Home conversion layout (hero → trust → services → book)
- Services discovery (carousel → search + categories + list)
- Booking step visuals + service picker
- Tab bar Book emphasis (raised gold action)
- Design tokens (exact brand blues/golds, spacing, radii, motion)
- Service detail sticky Book CTA
- Splash (native white vs JS navy mismatch)
- Profile clutter / “coming soon” placeholders
- Cases labeling (“My Services”) and status clarity
- Image/asset weight; remove unused launch video dependency

### REMOVE (safe after verification)
- `assets/launch-intro.mp4` (already deleted) + unused `expo-video` plugin/dep
- Dead root `App.tsx` boilerplate (leave file if tooling expects it; unused by entry)
- Competing Sales/RE CTAs on guest home closing card
- Hardcoded fake-feeling marketing noise that dilutes Book

### INVESTIGATE (do not remove yet)
- Smart Match module (bundled but flagged off)
- Voice FAB / speech recognition (layout impact on every tab)
- Payments feature module (no UI; may return)
- Mock ads (`AdSlot` / categories)
- Unpaginated cases/documents APIs

---

## Booking funnel issues

| Issue | Impact | Plan |
| --- | --- | --- |
| Home buried Book behind long scroll (testimonials, Sales/RE) | Lower conversion | Reorder to hero CTA → trust → service grid → track banner |
| Category tiles browse-only (not book) | Extra taps | Popular tiles book or open detail with clear Book |
| Services carousel harder to scan | Discovery friction | List + search + category pills |
| Detail Book CTA below long content | Missed conversion | Sticky bottom Book bar |
| Guest cannot track after submit | Support load / drop-off | Track banner → login or contact; keep guest book |
| `book.tsx` monolith (~880 lines) | Maintainability | Visual polish first; extract later |
| Funnel analytics `__DEV__` only | No production insight | Keep hooks; wire later |

**Target:** Book within 1–2 taps from home (hero CTA or tab Book / service tile).

---

## Performance issues

| Risk | Notes | Plan |
| --- | --- | --- |
| Launch video 5.2 MB | Removed; LaunchAnimation is gradient+logo | Remove `expo-video` |
| Remote service posters | No explicit cache layer | Prefer icons on home/list; keep posters on detail |
| Duplicate service card families | Bundle + confusion | Prefer one list/grid pattern for redesign surfaces |
| Member home fires cases+documents on mount | OK for members; gate guests | Already gated |
| Smart Match / voice always in graph | Bundle weight | Leave gated; do not delete |
| Native splash `#ffffff` | Flash before navy splash | Set splash to brand navy |

---

## Risk assessment

| Risk | Mitigation |
| --- | --- |
| Breaking booking API | Keep payload, drafts, slug aliases, checkout rules |
| Soft-launch / role tabs | Preserve `href: null` gating; only restyle Book tab |
| i18n regressions | Update EN + TH keys together |
| Dark/night themes | Use `useTheme()` + tokens, not hardcoded light-only Tailwind |
| Freelancer/corporate IA | Hide redesign chrome behind existing role gates |

---

## Implementation plan (execution order)

1. Audit doc (this file)
2. Centralize tokens + motion constants (exact brand hexes)
3. Home redesign (header, hero, trust strip, popular grid, banners)
4. Raised Book tab + “My Services” label
5. Services list UX + sticky detail CTA
6. Booking stepper/picker polish
7. Cases / profile polish
8. Splash + remove unused video dep
9. Validate with `npm test` / `npm run typecheck`

---

## Dependencies note

Do **not** remove working business modules solely for simplicity. Soft-launch already hides marketplace and deferred journeys from primary IA while keeping routes reachable from More where intended.
