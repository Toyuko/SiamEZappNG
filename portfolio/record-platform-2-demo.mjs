/**
 * Record a Platform 2.0 feature demo (Playwright video).
 *
 * Serve:  npx serve dist-demo -l 4174 --single
 * Run:    DEMO_BASE_URL=http://127.0.0.1:4174 node portfolio/record-platform-2-demo.mjs
 *
 * Note: web auth is in-memory only — never full-reload after login.
 */
import { chromium, devices } from '@playwright/test';
import { mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'demo');
const VIDEO_DIR = path.join(OUT_DIR, 'raw');
const BASE = process.env.DEMO_BASE_URL || 'http://127.0.0.1:4174';
const FINAL = path.join(OUT_DIR, 'siamez-platform-2-demo.mp4');

const DEMO_USER = {
  id: 'demo-client-1',
  email: 'demo@siamez.com',
  name: 'Alex Demo',
  role: 'customer',
};

const GOALS = [
  {
    id: 'g1',
    userId: DEMO_USER.id,
    title: 'Buy motorcycle in Bangkok',
    notes: 'Under 100,000 THB',
    status: 'active',
    progressPct: 40,
    lifeEventId: 'le1',
    workflowTemplateId: null,
    lifeEvent: {
      id: 'le1',
      key: 'buy-vehicle',
      titleEn: 'Buy a vehicle in Thailand',
      titleTh: null,
    },
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'g2',
    userId: DEMO_USER.id,
    title: 'Find condo for rent',
    notes: null,
    status: 'active',
    progressPct: 15,
    lifeEventId: null,
    workflowTemplateId: null,
    createdAt: '2026-07-15T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
  },
];

const LIFE_EVENT = {
  id: 'le1',
  key: 'buy-vehicle',
  titleEn: 'Buy a vehicle in Thailand',
  titleTh: null,
  descriptionEn: 'From shortlist to registration — checklist synced across devices.',
  descriptionTh: null,
  active: true,
  sortOrder: 1,
  steps: [
    {
      id: 's1',
      titleEn: 'Set your budget',
      titleTh: null,
      descriptionEn: 'Decide price range and category',
      descriptionTh: null,
      sortOrder: 1,
      target: null,
    },
    {
      id: 's2',
      titleEn: 'Shortlist vehicles',
      titleTh: null,
      descriptionEn: 'Save and compare listings',
      descriptionTh: null,
      sortOrder: 2,
      target: { listingType: 'vehicle' },
    },
    {
      id: 's3',
      titleEn: 'Book inspection',
      titleTh: null,
      descriptionEn: 'Schedule a viewing',
      descriptionTh: null,
      sortOrder: 3,
      target: null,
    },
    {
      id: 's4',
      titleEn: 'Register the vehicle',
      titleTh: null,
      descriptionEn: 'Complete paperwork with SiamEZ',
      descriptionTh: null,
      sortOrder: 4,
      target: { serviceSlug: 'vehicle-registration' },
    },
  ],
};

const LIFE_RUN = {
  id: 'run1',
  lifeEventId: 'le1',
  status: 'active',
  startedAt: '2026-07-10T00:00:00.000Z',
  completedAt: null,
  updatedAt: '2026-08-01T00:00:00.000Z',
  lifeEvent: LIFE_EVENT,
  steps: [
    {
      id: 'sp1',
      stepId: 's1',
      status: 'completed',
      startedAt: '2026-07-10T00:00:00.000Z',
      completedAt: '2026-07-11T00:00:00.000Z',
    },
    {
      id: 'sp2',
      stepId: 's2',
      status: 'started',
      startedAt: '2026-07-12T00:00:00.000Z',
      completedAt: null,
    },
    { id: 'sp3', stepId: 's3', status: 'pending', startedAt: null, completedAt: null },
    { id: 'sp4', stepId: 's4', status: 'pending', startedAt: null, completedAt: null },
  ],
};

const SAVED_HUB = {
  saved: [
    {
      listingType: 'vehicle',
      listingId: 'v1',
      title: '2022 Honda CB150R',
      priceAmount: 89000,
      priceCurrency: 'THB',
      heroImageUrl: 'https://images.unsplash.com/photo-1558981806-ec527636ea3f?w=400',
      href: '/sales/v1',
      subtitle: 'Bangkok · Automatic',
      savedAt: '2026-07-28T00:00:00.000Z',
    },
    {
      listingType: 'property',
      listingId: 'p1',
      title: 'Sukhumvit Condo · 1BR',
      priceAmount: 28000,
      priceCurrency: 'THB',
      heroImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      href: '/real-estate/p1',
      subtitle: 'Rent · Near BTS Nana',
      savedAt: '2026-07-30T00:00:00.000Z',
    },
  ],
  recent: [
    {
      listingType: 'vehicle',
      listingId: 'v2',
      title: 'Yamaha NMAX 155',
      priceAmount: 75000,
      priceCurrency: 'THB',
      heroImageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400',
      href: '/sales/v2',
      subtitle: 'Chiang Mai',
      viewedAt: '2026-08-01T00:00:00.000Z',
    },
  ],
  compare: [
    {
      listingType: 'vehicle',
      listingId: 'v1',
      title: '2022 Honda CB150R',
      priceAmount: 89000,
      priceCurrency: 'THB',
      heroImageUrl: 'https://images.unsplash.com/photo-1558981806-ec527636ea3f?w=400',
      href: '/sales/v1',
      subtitle: 'Bangkok · Automatic',
    },
  ],
  savedCount: 2,
  compareCount: 1,
};

async function installApiMocks(page) {
  // Single handler — Playwright last-registered route wins, so keep one.
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const fulfill = (body, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(body),
      });

    if (url.includes('/api/auth/login')) {
      return fulfill({ token: 'demo-platform-token', user: DEMO_USER });
    }
    if (url.includes('/api/auth/me')) {
      return fulfill(DEMO_USER);
    }
    if (url.includes('/api/v1/goals')) {
      if (method === 'POST') {
        const title = JSON.parse(route.request().postData() || '{}').title || 'New goal';
        return fulfill({
          data: {
            ...GOALS[0],
            id: `g-${Date.now()}`,
            title,
            progressPct: 0,
            lifeEventId: null,
            lifeEvent: null,
          },
        });
      }
      return fulfill({ data: GOALS });
    }
    if (url.includes('/api/v1/life-events/runs') || url.includes('/life-events/runs')) {
      return fulfill({ data: [LIFE_RUN] });
    }
    if (url.includes('/api/v1/life-events')) {
      return fulfill({ data: [LIFE_EVENT] });
    }
    if (url.includes('/api/v1/marketplace/engagement')) {
      return fulfill({ data: SAVED_HUB });
    }
    if (url.includes('/api/v1/marketplace')) {
      return fulfill({ data: { saved: true, inCompare: true, compareCount: 1 } });
    }
    if (url.includes('/api/v1/recommendations')) {
      return fulfill({
        data: {
          suggestions: [
            {
              kind: 'vehicle',
              id: 'v1',
              title: 'Honda CB150R matches your budget goal',
              reason: 'Based on your active goal and saved vehicles',
            },
            {
              kind: 'service',
              id: 'vehicle-registration',
              title: 'Vehicle registration',
              reason: 'Next step in your Buy a vehicle journey',
            },
          ],
        },
      });
    }
    if (url.includes('/api/v1/concierge/chat')) {
      return fulfill({
        data: {
          content:
            'I found a few motorcycles under 100,000 THB in Bangkok. You can save them to compare, or continue your “Buy a vehicle” life event checklist.',
          recommendations: [
            {
              slug: 'vehicle-registration',
              name: 'Vehicle registration',
              shortDescription: 'Paperwork help after purchase',
              score: 0.9,
            },
          ],
          deepLinks: [
            { href: '/sales', label: 'Browse motorcycles', kind: 'listing' },
            { href: '/life-events', label: 'Open Life Events', kind: 'life_event' },
          ],
          mode: 'rule',
        },
      });
    }
    if (url.includes('/api/cases')) {
      return fulfill([{ id: 'c1' }, { id: 'c2' }]);
    }
    if (url.includes('/api/invoices')) {
      return fulfill([
        { id: 'i1', status: 'PENDING' },
        { id: 'i2', status: 'PAID' },
      ]);
    }
    if (url.includes('/api/v1/')) {
      return fulfill({ data: method === 'GET' ? [] : { ok: true } });
    }
    return fulfill([]);
  });
}

async function scrub(page) {
  await page
    .evaluate(() => {
      document.querySelectorAll('#error-overlay, [data-expo-error-overlay]').forEach((e) => e.remove());
    })
    .catch(() => {});
}

async function pause(page, ms = 1800) {
  await scrub(page);
  await page.waitForTimeout(ms);
}

async function clickText(page, name, { exact = false, last = false } = {}) {
  const locator = exact
    ? page.getByText(name, { exact: true })
    : page.getByText(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  const target = last ? locator.last() : locator.first();
  await target.waitFor({ state: 'visible', timeout: 20_000 });
  await target.click({ force: true });
}

async function clickTab(page, label) {
  // Tab bar labels sit at the bottom — prefer the last exact match.
  await clickText(page, label, { exact: true, last: true });
  await pause(page, 1800);
}

/** Non-destructive title card overlay (keeps SPA auth session alive). */
async function showTitleOverlay(page, title, subtitle) {
  await page.evaluate(
    ({ title, subtitle }) => {
      document.getElementById('demo-title')?.remove();
      const el = document.createElement('div');
      el.id = 'demo-title';
      el.style.cssText =
        'position:fixed;inset:0;z-index:999999;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:48px;text-align:center;color:#f8fafc;background:radial-gradient(ellipse at 20% 10%, rgba(44,84,198,0.45), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(14,165,233,0.22), transparent 50%), #0b1220;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;';
      el.innerHTML = `
        <div style="letter-spacing:0.18em;text-transform:uppercase;font-size:12px;color:#93c5fd;margin-bottom:18px;font-weight:600">SiamEZ · Platform 2.0</div>
        <h1 style="margin:0;font-size:32px;line-height:1.15;font-weight:700;max-width:16ch">${title}</h1>
        <p style="margin:18px 0 0;font-size:15px;line-height:1.45;color:#cbd5e1;max-width:26ch">${subtitle}</p>
      `;
      document.body.appendChild(el);
    },
    { title, subtitle },
  );
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.getElementById('demo-title')?.remove());
}

async function openFromMore(page, label) {
  await clickTab(page, 'More');
  await pause(page, 800);
  await clickText(page, label, { exact: true });
  await pause(page, 2600);
}

async function loginAsClient(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await pause(page, 2200);
  await page
    .getByText(/Welcome back|Sign In|Continue as Guest/i)
    .first()
    .waitFor({ timeout: 30_000 });
  await scrub(page);

  await page.locator('input[type="email"]').fill(DEMO_USER.email);
  await page.locator('input[type="password"]').fill('DemoPass123!');
  await page.getByRole('button', { name: /^Sign In$/i }).click();
  await page.waitForURL(/services|home|more|dashboard/i, { timeout: 20_000 }).catch(() => {});
  await pause(page, 2500);
  await scrub(page);
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 14 Pro'];
  const context = await browser.newContext({
    ...iPhone,
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: iPhone.viewport.width, height: iPhone.viewport.height },
    },
  });
  const page = await context.newPage();
  await installApiMocks(page);

  console.log(`Recording demo from ${BASE}`);

  // Opening card before app load
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:48px;text-align:center;color:#f8fafc;background:radial-gradient(ellipse at 20% 10%, rgba(44,84,198,0.45), transparent 55%), #0b1220;font-family:system-ui,sans-serif">
    <div style="letter-spacing:0.18em;text-transform:uppercase;font-size:12px;color:#93c5fd;margin-bottom:18px;font-weight:600">SiamEZ · Platform 2.0</div>
    <h1 style="margin:0;font-size:32px;line-height:1.15;max-width:16ch">New in the mobile app</h1>
    <p style="margin:18px 0 0;font-size:15px;color:#cbd5e1;max-width:26ch">Goals, Life Events, Saved hub, Concierge, and Dashboard — synced with the Platform.</p>
  </body></html>`);
  await page.waitForTimeout(2200);

  await loginAsClient(page);
  console.log('After login:', page.url());

  await showTitleOverlay(page, 'Member workspace', 'Sign in once — continue website workflows on mobile.');
  await pause(page, 1200);

  await showTitleOverlay(
    page,
    'Dashboard',
    'One workspace for goals, journeys, bookings, and saved listings.',
  );
  await openFromMore(page, 'Dashboard');
  await page.mouse.wheel(0, 420);
  await pause(page, 1800);

  await showTitleOverlay(page, 'Goals', 'Create and track goals synced with the Platform portal.');
  await openFromMore(page, 'Goals');
  await pause(page, 2000);

  await showTitleOverlay(
    page,
    'Life Events',
    'Start journeys and checklists that carry across devices.',
  );
  await openFromMore(page, 'Life Events');
  await page.mouse.wheel(0, 380);
  await pause(page, 2200);

  await showTitleOverlay(
    page,
    'Saved & Compare',
    'Buyer hub for vehicles and properties you care about.',
  );
  await openFromMore(page, 'Saved & Compare');
  await page.mouse.wheel(0, 320);
  await pause(page, 2200);

  await showTitleOverlay(
    page,
    'AI Concierge',
    'Ask about services, vehicles, property, or life events.',
  );
  await openFromMore(page, 'AI Concierge');
  await pause(page, 1200);
  try {
    await clickText(page, 'Find a motorcycle under 100,000 baht');
    await pause(page, 4500);
  } catch (e) {
    console.warn('Concierge prompt skipped:', e.message);
  }

  await showTitleOverlay(
    page,
    'Marketplace sync',
    'Browse sales & real estate with save / compare wired to Platform APIs.',
  );
  await clickTab(page, 'Sales');
  await pause(page, 2200);
  await clickTab(page, 'Real Estate');
  await pause(page, 2200);

  await showTitleOverlay(
    page,
    'Continue on any device',
    'Website workflows — goals, life events, concierge, and saved listings — now live in the app.',
  );

  await context.close();
  await browser.close();

  const videos = (await readdir(VIDEO_DIR)).filter((f) => f.endsWith('.webm'));
  if (!videos.length) throw new Error('No Playwright video recorded');
  const rawWebm = path.join(VIDEO_DIR, videos[0]);

  console.log('Transcoding…');
  const ffmpeg = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      rawWebm,
      '-vf',
      'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      FINAL,
    ],
    { encoding: 'utf8' },
  );
  if (ffmpeg.status !== 0) {
    console.error(ffmpeg.stderr);
    await copyFile(rawWebm, path.join(OUT_DIR, 'siamez-platform-2-demo.webm'));
    throw new Error('ffmpeg failed; kept webm instead');
  }

  await copyFile(rawWebm, path.join(OUT_DIR, 'raw-demo.webm'));
  console.log(`\nDone → ${FINAL}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
