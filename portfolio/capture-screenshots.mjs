/**
 * Portfolio screenshots from static web export (EXPO_PUBLIC_E2E=true).
 * Serve: npx serve dist-portfolio -l 4173 --single
 * Run:   PORTFOLIO_BASE_URL=http://127.0.0.1:4173 node portfolio/capture-screenshots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'screenshots');
const BASE = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:4173';

async function scrub(page) {
  await page.evaluate(() => {
    document.querySelectorAll('#error-overlay').forEach((e) => e.remove());
  }).catch(() => {});
}

async function shot(page, name, note) {
  await scrub(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  const snippet = await page.evaluate(() => (document.body?.innerText || '').replace(/\s+/g, ' ').slice(0, 90));
  console.log(`✓ ${name}.png — ${note}`);
  console.log(`  ${page.url()} | ${snippet}`);
}

async function clickByName(page, name) {
  const btn = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
  if (await btn.count()) {
    await btn.click({ timeout: 10_000 });
    return true;
  }
  await page.getByText(name, { exact: false }).first().click({ force: true });
  return true;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });

  console.log(`Base: ${BASE}`);
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 120_000 }).catch(() =>
    page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 }),
  );
  await page.waitForTimeout(2500);
  await scrub(page);
  await page.getByText(/Welcome back|Continue as Guest|Sign In/i).first().waitFor({ timeout: 30_000 });
  await shot(page, '01-login', 'Auth / welcome');

  // Guest — role button click (fires RN Pressable)
  await clickByName(page, 'Continue as Guest');
  await page.waitForTimeout(3500);
  await scrub(page);
  console.log('After guest:', page.url());
  await shot(page, '03-services', 'Services (guest landing)');

  // Use in-app tab labels (no full reload)
  for (const [file, label, note] of [
    ['02-home', 'Home', 'Home'],
    ['08-sales', 'Sales', 'Sales'],
    ['07-real-estate', 'Real Estate', 'Real estate'],
    ['09-contact', 'Contact', 'Contact'],
  ]) {
    try {
      await page.getByText(label, { exact: true }).last().click({ force: true });
      await page.waitForTimeout(2500);
      await scrub(page);
      await shot(page, file, note);
    } catch (e) {
      console.error(`✗ ${file}:`, e.message);
    }
  }

  // Back to services + open a detail if possible
  try {
    await page.getByText('Services', { exact: true }).last().click({ force: true });
    await page.waitForTimeout(2000);
    await scrub(page);
    await shot(page, '03b-services', 'Services again');

    const card = page.getByText(/Driver|License|Translation|Marriage|Visa|Police/i).first();
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      await card.click({ force: true });
      await page.waitForTimeout(2500);
      await scrub(page);
      await shot(page, '04-service-detail', 'Service detail');
    }
  } catch (e) {
    console.error('services detail:', e.message);
  }

  // Book via More/services CTA if tab missing for guest
  try {
    const bookTab = page.getByText('Book', { exact: true }).last();
    if (await bookTab.isVisible({ timeout: 1500 }).catch(() => false)) {
      await bookTab.click({ force: true });
      await page.waitForTimeout(2500);
      await shot(page, '05-book', 'Booking');
    }
  } catch {
    /* optional */
  }

  // Freelancer login (fresh session)
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await scrub(page);
  await clickByName(page, 'Use demo freelancer account');
  await page.waitForTimeout(500);
  await clickByName(page, 'Sign In');
  await page.waitForTimeout(6000);
  await scrub(page);
  console.log('After freelancer login:', page.url());
  await shot(page, '10-freelancer-portal', 'Freelancer portal');

  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
