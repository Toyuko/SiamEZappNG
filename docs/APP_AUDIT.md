# SiamEZ App Audit — Unified Redesign Pass

**Date:** 21 November 2026  
**Visual source of truth:** latest Home screenshot (deep royal `#0645B5` + yellow `#FFD500`)  
**Brand alignment:** https://siam-ez.com/

---

## Architecture (unchanged)

Expo SDK 55 / RN 0.83 / expo-router / Zustand / TanStack Query / NativeWind + `lib/theme/*`.  
Remote API: `https://siam-ez.com`. Soft-launch feature flags gate marketplace / deferred journeys.

---

## Feature classification

### KEEP
- Guest + member booking (`POST /api/bookings`), drafts, guest checkout
- Auth (email / OAuth / guest), cases, documents, push deep links
- Static service catalog aligned with website offerings
- Soft-launch, Chatwoot, freelancer/corporate portals

### IMPROVE
- Unified design tokens to screenshot palette
- Home / Services / Booking / More / Account visual system
- Booking CTA labels (specific verbs)
- PageHeader continuous orb animations → static (perf)
- Raised Book tab (blue calendar on yellow)

### REMOVE
- Guest home closing card noise (Sales/RE/testimonials already removed)
- Deferred More clutter (Goals / Life Events / Workflows / Saved) from soft-launch menu
- Continuous PageHeader oscillation animations
- Unused launch video / `expo-video` (prior pass)

### INVESTIGATE
- Smart Match (flagged off)
- Voice FAB layout cost
- Guest post-booking case lookup
- Freelancer directory uncommitted tweaks (not part of this redesign)

---

## Conversion funnel

`Home → Service tile/detail → Book → Details → Review → Confirm`

1-tap book from home tiles and raised tab. Guest booking preserved.

---

## Performance actions this pass

| Change | Why |
| --- | --- |
| Static PageHeader decorations | Stop infinite Reanimated loops on many screens |
| Slimmer guest home | Fewer mounts / less scroll weight |
| Token-driven colors | Avoid mismatched hardcodes |
| Existing: no launch video | Cold start |

---

## Risks

- Do not delete Smart Match / marketplace modules (backend + role portals depend on routes)
- Soft-launch More still exposes Vehicles/Property intentionally
- Profile still has “coming soon” rows for unsupported account edits
