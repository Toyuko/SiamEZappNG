/**
 * Canonical marketing host. Prefer this once DNS for siam-ez.com is healthy again.
 * Nameservers (nsraidth1.com) are currently unreachable, so API traffic must not
 * depend on resolving that hostname.
 */
const DEFAULT_CANONICAL_HOST = 'https://siam-ez.com';

/**
 * Working production API origin (Vercel project alias). Email auth / bookings hit this
 * while the custom domain DNS is broken. Switch DEFAULT_API_URL back to
 * DEFAULT_CANONICAL_HOST after the registrar nameservers are restored.
 */
const DEFAULT_API_URL = 'https://siam-e-zweb-ng.vercel.app';

function isStoreReleaseBuild() {
  return typeof __DEV__ !== 'undefined' && __DEV__ === false;
}

/**
 * Resolve a public base URL. In release builds, reject localhost / cleartext / emulator
 * loopbacks so a misconfigured EAS env cannot silently ship a broken production binary.
 */
export function resolvePublicBaseUrl(
  value: string | undefined,
  fallback: string,
  label: string,
): string {
  const raw = (value ?? fallback).trim();
  const normalized = (raw.length > 0 ? raw : fallback).replace(/\/+$/, '');

  if (isStoreReleaseBuild()) {
    const lower = normalized.toLowerCase();
    if (
      lower.includes('localhost') ||
      lower.includes('127.0.0.1') ||
      lower.includes('10.0.2.2') ||
      lower.startsWith('http://')
    ) {
      throw new Error(
        `[SiamEZ] Invalid production ${label}: must be an https production URL (got "${normalized}").`,
      );
    }
  }

  return normalized;
}

export const appConfig = {
  // Support both names while we transition env keys.
  apiUrl: resolvePublicBaseUrl(
    process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL,
    DEFAULT_API_URL,
    'API URL',
  ),
  // OAuth / guest checkout still prefer the canonical host when DNS works.
  webBaseUrl: resolvePublicBaseUrl(
    process.env.EXPO_PUBLIC_WEB_BASE_URL,
    DEFAULT_CANONICAL_HOST,
    'web base URL',
  ),
  appName: 'SiamEZ',
};
