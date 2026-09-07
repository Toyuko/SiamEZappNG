import { afterEach, describe, expect, it, vi } from 'vitest';

describe('resolvePublicBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('uses the production default when env is unset', async () => {
    const { resolvePublicBaseUrl } = await import('../../lib/config');
    expect(resolvePublicBaseUrl(undefined, 'https://siam-ez.com', 'API URL')).toBe(
      'https://siam-ez.com',
    );
  });

  it('strips trailing slashes', async () => {
    const { resolvePublicBaseUrl } = await import('../../lib/config');
    expect(
      resolvePublicBaseUrl('https://siam-ez.com/', 'https://fallback.example', 'API URL'),
    ).toBe('https://siam-ez.com');
  });

  it('rejects localhost in store release builds', async () => {
    vi.stubGlobal('__DEV__', false);
    vi.resetModules();
    const { resolvePublicBaseUrl } = await import('../../lib/config');
    expect(() =>
      resolvePublicBaseUrl('http://localhost:3000', 'https://siam-ez.com', 'API URL'),
    ).toThrow(/Invalid production API URL/);
  });

  it('rejects cleartext http in store release builds', async () => {
    vi.stubGlobal('__DEV__', false);
    vi.resetModules();
    const { resolvePublicBaseUrl } = await import('../../lib/config');
    expect(() =>
      resolvePublicBaseUrl('http://siam-ez.com', 'https://siam-ez.com', 'web base URL'),
    ).toThrow(/Invalid production web base URL/);
  });

  it('allows localhost outside release builds', async () => {
    vi.stubGlobal('__DEV__', true);
    vi.resetModules();
    const { resolvePublicBaseUrl } = await import('../../lib/config');
    expect(resolvePublicBaseUrl('http://10.0.2.2:3000', 'https://fallback.example', 'API URL')).toBe(
      'http://10.0.2.2:3000',
    );
  });
});
