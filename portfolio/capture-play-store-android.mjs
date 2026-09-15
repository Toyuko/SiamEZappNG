/**
 * Google Play phone screenshots from a running Android emulator.
 *
 * Requires: emulator booted, SiamEZ installed, adb on PATH.
 * Output: play-store/phone/*.png at 1080×1920 (9:16).
 *
 *   ANDROID_HOME=$HOME/Library/Android/sdk PATH="$ANDROID_HOME/platform-tools:$PATH" \
 *     node portfolio/capture-play-store-android.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'play-store', 'phone');
const PKG = 'com.siamez.app';
const ACTIVITY = 'com.siamez.app.MainActivity';
const ADB = process.env.ADB || 'adb';
const DUMP = '/sdcard/window_dump.xml';

function adb(args, opts = {}) {
  return execFileSync(ADB, args, { encoding: 'utf8', ...opts });
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function parseNodes(xml) {
  const nodes = [];
  for (const m of xml.matchAll(/<node\b([^>]*)>/g)) {
    const attrs = m[1];
    const get = (key) => {
      const mm = attrs.match(new RegExp(`${key}="([^"]*)"`));
      return mm ? decode(mm[1]) : '';
    };
    const bounds = get('bounds').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!bounds) continue;
    nodes.push({
      text: get('text'),
      desc: get('content-desc'),
      clickable: get('clickable') === 'true',
      x1: +bounds[1],
      y1: +bounds[2],
      x2: +bounds[3],
      y2: +bounds[4],
    });
  }
  return nodes;
}

function decode(s) {
  return s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"');
}

function dumpUi() {
  try {
    adb(['shell', 'uiautomator', 'dump', DUMP], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    sleep(400);
    adb(['shell', 'uiautomator', 'dump', DUMP], { stdio: ['ignore', 'pipe', 'pipe'] });
  }
  return adb(['exec-out', 'cat', DUMP]);
}

function visibleText() {
  return dumpUi()
    .split('\n')
    .join(' ')
    .replace(/<[^>]+>/g, ' ');
}

function findNodes(pattern, { last = false, nearBottom = false, clickableFirst = true } = {}) {
  let nodes = parseNodes(dumpUi()).filter((n) => pattern.test(n.text) || pattern.test(n.desc));
  if (nearBottom) nodes.sort((a, b) => b.y1 - a.y1);
  else if (last) nodes.reverse();
  if (clickableFirst) {
    const clickable = nodes.filter((n) => n.clickable);
    if (clickable.length) return clickable;
  }
  return nodes;
}

function tapNode(node) {
  const x = Math.round((node.x1 + node.x2) / 2);
  const y = Math.round((node.y1 + node.y2) / 2);
  adb(['shell', 'input', 'tap', String(x), String(y)]);
}

function tapText(pattern, opts = {}) {
  const timeout = opts.timeout ?? 20_000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const nodes = findNodes(pattern, opts);
    if (nodes[0]) {
      tapNode(nodes[0]);
      return nodes[0];
    }
    sleep(500);
  }
  throw new Error(`No node matching ${pattern}`);
}

function waitFor(pattern, timeout = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const xml = dumpUi();
    const text = xml.replace(/<[^>]+>/g, ' ');
    if (pattern.test(text) || pattern.test(xml)) return true;
    sleep(700);
  }
  return false;
}

function dismissLogBox() {
  try {
    const nodes = parseNodes(dumpUi());
    const banner = nodes.find((n) => /Open debugger/i.test(`${n.text} ${n.desc}`));
    if (!banner) return;
    const x = Math.max(banner.x1 + 20, banner.x2 - 48);
    const y = Math.round((banner.y1 + banner.y2) / 2);
    adb(['shell', 'input', 'tap', String(x), String(y)]);
    sleep(500);
  } catch {
    /* ignore */
  }
}

function ensureAppForeground() {
  const resumed = adb(['shell', 'dumpsys', 'activity', 'activities']);
  if (!/com\.siamez\.app\/\.MainActivity/.test(resumed)) {
    adb(['shell', 'am', 'start', '-n', `${PKG}/${ACTIVITY}`]);
    sleep(2000);
  }
}

async function shot(name, note) {
  ensureAppForeground();
  dismissLogBox();
  sleep(700);
  const remote = `/sdcard/${name}.png`;
  const file = path.join(OUT, `${name}.png`);
  adb(['shell', 'screencap', '-p', remote]);
  adb(['pull', remote, file], { stdio: 'inherit' });
  console.log(`✓ ${name}.png — ${note}`);
}

function swipeUp() {
  adb(['shell', 'input', 'swipe', '540', '1400', '540', '620', '450']);
}

function back() {
  adb(['shell', 'input', 'keyevent', 'KEYCODE_BACK']);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log('Preparing 1080×1920 Play Store viewport…');
  adb(['shell', 'svc', 'power', 'stayon', 'true']);
  adb(['shell', 'wm', 'size', '1080x1920']);
  try {
    adb(['shell', 'cmd', 'overlay', 'enable', 'com.android.internal.systemui.navbar.gestural']);
  } catch {
    /* gesture nav overlay name varies by image */
  }
  sleep(800);

  for (const perm of [
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.RECORD_AUDIO',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.CAMERA',
  ]) {
    try {
      adb(['shell', 'pm', 'grant', PKG, perm]);
    } catch {
      /* not requested or not grantable */
    }
  }

  console.log('Launching SiamEZ…');
  if (!waitFor(/Continue as Guest|Welcome back to SiamEZ/i, 4_000)) {
    adb(['shell', 'am', 'force-stop', PKG]);
    sleep(400);
    adb(['shell', 'am', 'start', '-n', `${PKG}/${ACTIVITY}`]);
    const ready = waitFor(/Continue as Guest|Welcome back|Sign In/i, 45_000);
    if (!ready) {
      console.log('Login copy not found yet; waiting for launch video…');
      sleep(12_000);
    }
    sleep(1_500);
  }

  if (!waitFor(/Continue as Guest|Welcome back/i, 20_000)) {
    throw new Error('Login screen did not appear');
  }

  dismissLogBox();
  sleep(600);
  await shot('01-welcome', 'Sign in / welcome');

  tapText(/Continue as Guest/i);
  waitFor(/Services|Featured services|Find the right service/i, 25_000);
  sleep(2_000);
  await shot('02-services', 'Services catalog');

  try {
    tapText(/More Details/i);
    waitFor(/Back to services|Service overview|HAPPY CLIENTS/i, 15_000);
    sleep(1_200);
    await shot('03-service-detail', 'Service detail');
    back();
    sleep(1_200);
  } catch (e) {
    console.warn('service detail skipped:', e.message);
  }

  tapText(/^Sales$/i, { nearBottom: true });
  waitFor(/Toyota|Honda|Yamaha|Fortuner|Isuzu|Mazda|Rebel|Available/i, 30_000);
  sleep(800);
  swipeUp();
  sleep(700);
  swipeUp();
  sleep(1_000);
  await shot('04-vehicles', 'Vehicle sales inventory');

  tapText(/^(Property|Real Estate)$/i, { nearBottom: true });
  waitFor(/Townhome|Townhouse|Condo|Bangkok|for Rent|Available/i, 30_000);
  sleep(800);
  swipeUp();
  sleep(700);
  swipeUp();
  sleep(1_000);
  await shot('05-real-estate', 'Real estate listings');

  try {
    tapText(/^More$/i, { nearBottom: true });
    sleep(800);
    tapText(/Ask SiamEZ/i);
    waitFor(/AI Concierge|Ask Concierge/i, 15_000);
    sleep(800);
    try {
      tapText(/I want to move to Thailand/i, { timeout: 8_000 });
      waitFor(/Relocating to Thailand|Visa assistance|Goal updated/i, 12_000);
    } catch {
      /* chips may differ */
    }
    sleep(1_000);
    await shot('06-concierge', 'AI Concierge');
  } catch (e) {
    console.warn('concierge skipped:', e.message);
  }

  try {
    back();
    sleep(800);
    if (!/Book a service/.test(visibleText())) {
      tapText(/^More$/i, { nearBottom: true });
      sleep(600);
    }
    tapText(/Book a service/i);
    waitFor(/Client details|Book a service|Marriage/i, 15_000);
    sleep(1_200);
    await shot('07-booking', 'Booking wizard');
  } catch (e) {
    console.warn('booking skipped:', e.message);
  }

  try {
    tapText(/^Sales$/i, { nearBottom: true });
    waitFor(/Toyota|Honda|Rebel|Available/i, 20_000);
    swipeUp();
    sleep(600);
    tapText(/Honda Rebel|Toyota Fortuner|Mazda/i, { timeout: 10_000 });
    waitFor(/Back to inventory|MILEAGE|Gallery/i, 12_000);
    sleep(1_200);
    await shot('08-vehicle-detail', 'Vehicle listing detail');
  } catch (e) {
    console.warn('vehicle detail skipped:', e.message);
  }

  console.log(`\nDone → ${OUT}`);
  console.log('Leaving emulator at 1080×1920. Reset later with: adb shell wm size reset');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
