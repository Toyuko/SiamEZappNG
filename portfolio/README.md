# SiamEZ — Portfolio Project Pack

Ready-to-paste copy, screenshots, and asset notes for your portfolio site.

---

## One-liner

**SiamEZ** — a bilingual Thailand expat services marketplace (Expo + React Native) with booking, case tracking, voice search, and realtime freelancer jobs.

---

## Short description (≈50 words)

SiamEZ is a production Expo/React Native app for expats and locals in Thailand. Clients browse and book services (visas, translations, driver’s licenses, and more), while freelancers pick up live jobs with chat and GPS track-and-trace. Built with role-based portals, Thai/English i18n, and a shared remote API.

---

## Medium description (≈120 words)

SiamEZ is a multi-sided marketplace and client portal for professional services across Thailand. The mobile app (Expo SDK 55, React Native, TypeScript) lets guests and customers discover services, book online, manage cases and documents, and follow job progress with live chat and location updates. Freelancers get a realtime job board (Pusher), earnings/escrow flows, and Track & Trace. Corporates get hiring and ad tools. Adjacent marketplace surfaces cover vehicle sales and real estate listings.

I built the app as a route-driven Expo Router client against the existing SiamEZ web backend, with NativeWind theming, Zustand session state, TanStack Query data fetching, voice-first search, and English/Thai localization.

---

## Long / case-study description

### Problem
Expats and businesses in Thailand juggle visas, documents, licenses, property, and transport through fragmented agencies and chat threads. SiamEZ needed a native-quality mobile experience that matched its web platform—booking, tracking, and marketplace hiring in one place.

### Solution
A single Expo + React Native codebase with role-based shells:

| Role | Experience |
|------|------------|
| **Guest / Client** | Browse services, book, contact, sales & real estate |
| **Freelancer** | Live job board, accept work, chat, GPS tracking, earnings |
| **Corporate** | Insights, job posts, ads, company profile |

### Highlights I shipped
- **Expo Router** file-based navigation (auth stack + tab shells per role)
- **Service catalog + booking wizard** wired to the remote SiamEZ API
- **Realtime** freelancer feed and chat via **Pusher**
- **Job Track & Trace** with timeline, attachments, and live location sharing
- **Voice-first FAB** (speech recognition + fuzzy search) for hands-free navigation
- **i18n** English / Thai throughout
- **NativeWind + Geist** theming (light / dark)
- Unit tests (**Vitest**) and web e2e (**Playwright**)

### Stack
Expo 55 · React Native 0.83 · React 19 · TypeScript · Expo Router · NativeWind · Zustand · TanStack Query · Axios · Pusher · i18n-js · Reanimated · Gifted Chat · Vitest · Playwright

### Links
- Companion web: [siam-e-zweb-ng.vercel.app](https://siam-e-zweb-ng.vercel.app/en)
- Repo: `SiamEZappNG` (Expo mobile client)

---

## Paste-ready blurb variants

**Hero / project title**  
SiamEZ Mobile — Thailand Services Marketplace

**Tagline**  
Trusted Thai services, booking, and live job tracking in one app.

**Bullet features (for cards)**
- Multi-role portals (client, freelancer, corporate)
- Service booking + case/document hub
- Realtime freelancer jobs & chat
- Voice search and bilingual EN/TH UX
- Vehicle sales & real estate marketplace tabs

**Tech chips**  
`Expo` `React Native` `TypeScript` `Expo Router` `NativeWind` `Zustand` `TanStack Query` `Pusher`

---

## Screenshot guide

Use these from `portfolio/screenshots/` on your site:

| File | Use as | Notes |
|------|--------|--------|
| `00-app-icon.png` | Favicon / project badge | App icon |
| `00-logo.png` | Brand mark | Elephant logo |
| `01-login.png` | **Hero / primary** | Phone-framed auth (light) — best cover |
| `01-login-dark.png` | Alt hero | Dark phone-framed auth |
| `01-login-framed.png` | Alt | Another framed login capture |
| `02-home.png` | Feature 1 | Guest home — hero, stats, how-it-works |
| `08-sales.png` | Feature 2 | Vehicle sales inventory + filters |
| `07-real-estate.png` | Feature 3 | Property listings marketplace |
| `09-contact.png` | Feature 4 | Contact + booking inquiry form |
| `11-web-companion.png` | Optional | Matching marketing website (same product) |

**Suggested gallery order on portfolio:**  
1 → login · 2 → home · 3 → real-estate · 4 → sales · 5 → contact · (+ web companion if you want ecosystem context)

---

## Suggested portfolio layout

1. **Cover:** `01-login.png` (phone mock) + title + one-liner  
2. **Overview:** short description + stack chips  
3. **Gallery:** 4–5 screenshots above  
4. **What I built:** 4–6 bullets from “Highlights”  
5. **CTA:** link to live web and/or GitHub  

---

## Re-capture screenshots

```bash
# Terminal A — skip launch video
EXPO_PUBLIC_E2E=true npm run web

# Terminal B
node portfolio/capture-screenshots.mjs
```

Guest/auth state is in-memory; prefer clicking through the UI (or use the browser) rather than full page reloads after “Continue as Guest.”
