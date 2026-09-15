/**
 * Google Play phone screenshots (2–8, PNG, 9:16, each side 320–3840px).
 *
 * Serve:  npx serve dist -l 4173 --single
 * Run:    PORTFOLIO_BASE_URL=http://127.0.0.1:4173 node portfolio/capture-play-store.mjs
 *
 * Output: play-store/phone/*.png at 1080×1920.
 */
import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'play-store', 'phone');
const BASE = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:4173';

/** Classic Play Store phone size: 1080×1920 = 9:16. */
const VIEWPORT = { width: 360, height: 640 };
const DEVICE_SCALE = 3;

const CONCIERGE_REPLY = {
  content:
    'Relocating to Thailand is a great journey to start. I can help with visa options, finding a place to live, and setting up a Life Event checklist so nothing gets missed.',
  recommendations: [
    {
      slug: 'visa-services',
      name: 'Visa assistance',
      shortDescription: 'Non-immigrant and long-stay visa help',
      score: 0.95,
      reason: 'Most relocators start here — paperwork before arrival',
    },
    {
      slug: 'translation-services',
      name: 'Document translation',
      shortDescription: 'Certified Thai/English translation',
      score: 0.78,
      reason: 'Useful for lease, bank, and immigration forms',
    },
  ],
  deepLinks: [
    { href: '/life-events', label: 'Start Life Event', kind: 'life_event' },
    { href: '/real-estate', label: 'Browse housing', kind: 'listing' },
    { href: '/services', label: 'All services', kind: 'service' },
  ],
  explanations: ['Recommended visa help because your message mentioned moving to Thailand.'],
  mode: 'rule',
};

async function scrub(page) {
  await page
    .evaluate(() => {
      document
        .querySelectorAll('#error-overlay, [data-expo-error-overlay], [id*="LogBox"]')
        .forEach((e) => e.remove());

      document.querySelectorAll('video').forEach((video) => {
        try {
          video.pause();
        } catch {
          /* ignore */
        }
        let node = video.parentElement;
        for (let i = 0; i < 8 && node; i += 1) {
          const z = Number.parseInt(window.getComputedStyle(node).zIndex, 10);
          if (z >= 9999) {
            node.style.display = 'none';
            node.style.opacity = '0';
            node.style.pointerEvents = 'none';
            return;
          }
          node = node.parentElement;
        }
      });

      [...document.querySelectorAll('div,button')].forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.position !== 'fixed') return;
        const rect = el.getBoundingClientRect();
        if (rect.width >= 48 && rect.width <= 76 && rect.right > window.innerWidth - 90 && rect.bottom > window.innerHeight - 160) {
          el.style.visibility = 'hidden';
        }
      });
    })
    .catch(() => {});
}

async function pause(page, ms = 800) {
  await scrub(page);
  await page.waitForTimeout(ms);
}

async function shot(page, name, note) {
  await scrub(page);
  await page.waitForTimeout(350);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, type: 'png' });
  const snippet = await page.evaluate(() =>
    (document.body?.innerText || '').replace(/\s+/g, ' ').slice(0, 110),
  );
  console.log(`✓ ${name}.png — ${note}`);
  console.log(`  ${page.url()} | ${snippet}`);
}

async function dismissVoiceOverlay(page) {
  const close = page.getByText(/^Close$/i).last();
  if (await close.isVisible().catch(() => false)) {
    await close.click({ force: true }).catch(() => {});
  }
  await page
    .evaluate(() => {
      const closeEl = [...document.querySelectorAll('div,button,span')].find((el) =>
        /^(Close|×|X)$/i.test((el.textContent || '').trim()),
      );
      closeEl?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    })
    .catch(() => {});
  await scrub(page);
}

async function clickText(page, name, { exact = true, last = true } = {}) {
  const locator = exact
    ? page.getByText(name, { exact: true })
    : page.getByText(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  const target = last ? locator.last() : locator.first();
  await target.waitFor({ state: 'attached', timeout: 20_000 });
  await target.click({ force: true }).catch(async () => {
    await target.dispatchEvent('click');
  });
}

async function clickTab(page, label) {
  await clickText(page, label, { exact: true, last: true });
  await pause(page, 1600);
  await dismissVoiceOverlay(page);
}

async function waitUntilGone(page, text, timeoutMs = 25_000) {
  await page
    .getByText(text, { exact: true })
    .first()
    .waitFor({ state: 'detached', timeout: timeoutMs })
    .catch(() => {});
}

async function waitForText(page, pattern, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const text = await page.evaluate(() => document.body?.innerText || '');
    if (pattern.test(text)) return true;
    await page.waitForTimeout(400);
  }
  return false;
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': '*',
  };
}

async function proxyLiveApi(route) {
  const request = route.request();
  const url = request.url();
  const method = request.method();
  const cors = corsHeaders();

  if (method === 'OPTIONS') {
    return route.fulfill({ status: 204, headers: cors });
  }

  const headers = { Accept: 'application/json' };
  const contentType = request.headers()['content-type'];
  if (contentType) headers['Content-Type'] = contentType;
  const res = await fetch(url, {
    method,
    headers,
    body: ['POST', 'PUT', 'PATCH'].includes(method) ? request.postData() : undefined,
  });
  const body = await res.text();
  return route.fulfill({
    status: res.status,
    contentType: res.headers.get('content-type') || 'application/json',
    headers: { ...cors, 'content-type': res.headers.get('content-type') || 'application/json' },
    body,
  });
}

async function installGuestProxy(page) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const cors = corsHeaders();

    if (method === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: cors });
    }

    if (url.includes('/api/v1/concierge/chat')) {
      await new Promise((r) => setTimeout(r, 350));
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { ...cors, 'content-type': 'application/json' },
        body: JSON.stringify({ success: true, data: CONCIERGE_REPLY }),
      });
    }

    return proxyLiveApi(route);
  });
}

async function gotoLogin(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 90_000 }).catch(() =>
    page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 90_000 }),
  );
  await pause(page, 2200);
  await page
    .getByText(/Welcome back|Continue as Guest|Sign In/i)
    .first()
    .waitFor({ timeout: 45_000 });
  await scrub(page);
}

async function newPhoneContext(browser) {
  const pixel = devices['Pixel 7'];
  return browser.newContext({
    ...pixel,
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE,
    colorScheme: 'light',
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  console.log(`Base: ${BASE}`);
  console.log(`Viewport: ${VIEWPORT.width}×${VIEWPORT.height} @${DEVICE_SCALE}x → 1080×1920`);

  const guestContext = await newPhoneContext(browser);
  const page = await guestContext.newPage();
  await installGuestProxy(page);

  await gotoLogin(page);
  await shot(page, '01-welcome', 'Sign in / welcome');

  await clickText(page, 'Continue as Guest', { exact: false, last: false });
  await page.waitForURL(/services|home|more/i, { timeout: 20_000 }).catch(() => {});
  await pause(page, 2800);
  await dismissVoiceOverlay(page);
  await shot(page, '02-services', 'Services catalog');

  try {
    const details = page.getByText(/More Details/i).first();
    await details.click({ force: true });
    await pause(page, 2200);
    await shot(page, '03-service-detail', 'Service detail');
    await page.goBack().catch(() => clickTab(page, 'Services'));
    await pause(page, 1600);
  } catch (e) {
    console.warn('service detail skipped:', e.message);
  }

  await clickTab(page, 'Sales');
  await waitUntilGone(page, 'Syncing listings with website inventory...', 30_000);
  await waitForText(page, /Toyota|Honda|Yamaha|Fortuner|Isuzu|Mazda/i, 25_000);
  const salesCard = page.getByText(/Toyota|Honda|Yamaha|Fortuner|Isuzu|Mazda/i).first();
  await salesCard.scrollIntoViewIfNeeded().catch(() => {});
  await pause(page, 1200);
  await shot(page, '04-vehicles', 'Vehicle sales inventory');

  await clickTab(page, 'Real Estate');
  await waitUntilGone(page, 'Syncing listings with website inventory...', 30_000);
  await waitForText(page, /Townhome|Townhouse|Condo|Bangkok|Samut Prakan|for Rent/i, 25_000);
  const reCard = page.getByText(/Townhome|Townhouse|Condo|for Rent|Mega Bangna/i).first();
  await reCard.scrollIntoViewIfNeeded().catch(() => {});
  await pause(page, 1200);
  await shot(page, '05-real-estate', 'Real estate listings');

  try {
    await clickTab(page, 'More');
    await clickText(page, 'Ask SiamEZ', { exact: true, last: true });
    await pause(page, 2000);
    await dismissVoiceOverlay(page);

    const chip = page.getByText('I want to move to Thailand', { exact: true }).last();
    await chip.waitFor({ state: 'attached', timeout: 10_000 });
    await chip.click({ force: true });
    await dismissVoiceOverlay(page);
    await waitForText(page, /Relocating to Thailand|Visa assistance|Goal updated/i, 12_000);
    await dismissVoiceOverlay(page);
    await pause(page, 800);
    await shot(page, '06-concierge', 'AI Concierge with recommendations');
  } catch (e) {
    console.warn('concierge skipped:', e.message);
    await clickTab(page, 'More').catch(() => {});
    await shot(page, '06-concierge', 'More hub (concierge fallback)');
  }

  try {
    await page.goBack().catch(() => clickTab(page, 'More'));
    await pause(page, 1200);
    await dismissVoiceOverlay(page);
    await clickText(page, 'Book a service', { last: true });
    await pause(page, 2200);
    await shot(page, '07-booking', 'Booking wizard');
  } catch (e) {
    console.warn('booking skipped:', e.message);
  }

  try {
    await clickTab(page, 'Sales');
    await waitForText(page, /Toyota|Honda|Yamaha|Fortuner|Isuzu|Mazda/i, 20_000);
    await salesCard.click({ force: true });
    await page.waitForURL(/sales\/.+/, { timeout: 8_000 }).catch(() => {});
    await pause(page, 2500);
    await shot(page, '08-vehicle-detail', 'Vehicle listing detail');
  } catch (e) {
    console.warn('vehicle detail skipped, using More:', e.message);
    await clickTab(page, 'More').catch(() => {});
    await pause(page, 800);
    await shot(page, '08-vehicle-detail', 'More hub fallback');
  }

  await guestContext.close();
  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
