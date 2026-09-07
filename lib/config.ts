const DEFAULT_WEB_BASE_URL = 'https://siam-ez.com';

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
    DEFAULT_WEB_BASE_URL,
    'API URL',
  ),
  webBaseUrl: resolvePublicBaseUrl(
    process.env.EXPO_PUBLIC_WEB_BASE_URL,
    DEFAULT_WEB_BASE_URL,
    'web base URL',
  ),
  appName: 'SiamEZ',
};
