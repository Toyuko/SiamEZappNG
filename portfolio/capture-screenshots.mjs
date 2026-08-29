/**
 * Portfolio screenshots of the current soft-launch guest IA.
 *
 * Build:  EXPO_PUBLIC_E2E=true npx expo export --platform web --output-dir dist-portfolio
 * Serve:  npx serve dist-portfolio -l 4173 --single
 * Run:    PORTFOLIO_BASE_URL=http://127.0.0.1:4173 node portfolio/capture-screenshots.mjs
 *
 * Guest auth is in-memory — never full-reload after Continue as Guest.
 * Marketplace APIs are proxied through Node to avoid browser CORS on localhost.
 */
import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'screenshots');
const BASE = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:4173';
const WEB = process.env.PORTFOLIO_WEB_URL || 'https://siam-e-zweb-ng.vercel.app/en';

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
  journey: {
    version: 1,
    topics: ['life_event', 'property', 'services'],
    activeGoals: [{ key: 'relocate-thailand', label: 'Relocate to Thailand', source: 'message' }],
    previousGoalKey: null,
    primaryGoalKey: 'relocate-thailand',
    messageCount: 1,
    lastUserMessage: 'I want to move to Thailand',
    updatedAt: new Date().toISOString(),
  },
  goalChange: {
    changed: true,
    fromKey: null,
    toKey: 'relocate-thailand',
    fromLabel: null,
    toLabel: 'Relocate to Thailand',
  },
};

async function scrub(page) {
  await page
    .evaluate(() => {
      document
        .querySelectorAll('#error-overlay, [data-expo-error-overlay], [id*="LogBox"]')
        .forEach((e) => e.remove());
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
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
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

async function installApiProxy(page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();
    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'access-control-allow-headers': '*',
    };

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

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const desktop = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });
  console.log(`Base: ${BASE}`);
  await gotoLogin(desktop);
  await shot(desktop, '01-login', 'Auth / welcome (phone-framed)');
  await desktop.close();

  const iPhone = devices['iPhone 14 Pro'];
  const context = await browser.newContext({
    ...iPhone,
    colorScheme: 'light',
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  await installApiProxy(page);

  await gotoLogin(page);
  await clickText(page, 'Continue as Guest', { exact: false, last: false });
  await page.waitForURL(/services|home|more/i, { timeout: 20_000 }).catch(() => {});
  await pause(page, 2800);
  await dismissVoiceOverlay(page);
  console.log('After guest:', page.url());
  await shot(page, '03-services', 'Services catalog (guest landing)');

  try {
    const details = page.getByText(/More Details/i).first();
    await details.click({ force: true });
    await pause(page, 2200);
    await shot(page, '04-service-detail', 'Service detail');
    await page.goBack().catch(() => clickTab(page, 'Services'));
    await pause(page, 1600);
  } catch (e) {
    console.warn('service detail skipped:', e.message);
  }

  await clickTab(page, 'Sales');
  await waitUntilGone(page, 'Syncing listings with website inventory...', 30_000);
  await waitForText(page, /Toyota|Honda|Yamaha|Fortuner|Isuzu/, 25_000);
  const salesCard = page.getByText(/Toyota|Honda|Yamaha|Fortuner|Isuzu/i).first();
  await salesCard.scrollIntoViewIfNeeded().catch(() => {});
  await pause(page, 1000);
  await shot(page, '08-sales', 'Vehicle sales inventory');
  try {
    await salesCard.click({ force: true });
    await pause(page, 2500);
    await shot(page, '08b-sales-detail', 'Vehicle listing detail');
    await page.goBack().catch(() => {});
    await pause(page, 1400);
  } catch (e) {
    console.warn('sales detail skipped:', e.message);
  }

  await clickTab(page, 'Real Estate');
  await waitUntilGone(page, 'Syncing listings with website inventory...', 30_000);
  await waitForText(page, /Townhome for Rent|Mega Bangna|Samut Prakan/i, 25_000);
  const reCard = page.getByText(/Townhome for Rent|Mega Bangna|Supalai Bella/i).first();
  await reCard.scrollIntoViewIfNeeded().catch(() => {});
  await pause(page, 1000);
  await shot(page, '07-real-estate', 'Real estate listings');
  try {
    await reCard.click({ force: true });
    await page.waitForURL(/real-estate\/.+/, { timeout: 8_000 }).catch(() => {});
    await pause(page, 2500);
    await shot(page, '07b-real-estate-detail', 'Property listing detail');
    await page.goBack().catch(() => {});
    await pause(page, 1400);
  } catch (e) {
    console.warn('real estate detail skipped:', e.message);
  }

  await clickTab(page, 'Contact');
  await pause(page, 600);
  await shot(page, '09-contact', 'Contact + inquiry');

  await clickTab(page, 'More');
  await pause(page, 600);
  await shot(page, '06-more', 'More hub (Ask SiamEZ, search, book)');

  try {
    await clickText(page, 'Ask SiamEZ', { exact: true, last: true });
    await pause(page, 2000);
    await dismissVoiceOverlay(page);
    await shot(page, '10-concierge', 'AI Concierge welcome');

    const chip = page.getByText('I want to move to Thailand', { exact: true }).last();
    await chip.waitFor({ state: 'attached', timeout: 10_000 });
    await chip.click({ force: true });
    await dismissVoiceOverlay(page);
    await waitForText(page, /Relocating to Thailand|Visa assistance|Goal updated/, 12_000);
    await dismissVoiceOverlay(page);
    await page
      .getByText(/Relocating to Thailand|Visa assistance/i)
      .first()
      .scrollIntoViewIfNeeded()
      .catch(() => {});
    await pause(page, 800);
    await shot(page, '10b-concierge-reply', 'Concierge reply with recommendations');
  } catch (e) {
    console.warn('concierge skipped:', e.message);
  }

  try {
    await page.goBack().catch(() => clickTab(page, 'More'));
    await pause(page, 1200);
    await dismissVoiceOverlay(page);
    await clickText(page, 'Book a service', { last: true });
    await pause(page, 2200);
    await shot(page, '05-book', 'Booking wizard');
  } catch (e) {
    console.warn('booking skipped:', e.message);
  }

  await context.close();

  const webPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });
  try {
    await webPage.goto(WEB, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await webPage.waitForTimeout(2500);
    await shot(webPage, '11-web-companion', 'Companion marketing website');
  } catch (e) {
    console.warn('web companion skipped:', e.message);
  }
  await webPage.close();

  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
