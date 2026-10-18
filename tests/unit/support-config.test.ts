import { afterEach, describe, expect, it, vi } from 'vitest';

describe('resolveChatwootConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns disabled when EXPO_PUBLIC_CHATWOOT_ENABLED is false', async () => {
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_ENABLED', 'false');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_BASE_URL', 'https://app.chatwoot.com');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN', 'tok');
    const { resolveChatwootConfig } = await import('../../features/support/config');
    const config = resolveChatwootConfig(process.env);
    expect(config.enabled).toBe(false);
    if (!config.enabled) {
      expect(config.reason).toBe('disabled');
    }
  });

  it('returns missing_config when URL or token is absent', async () => {
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_ENABLED', 'true');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_BASE_URL', '');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN', '');
    const { resolveChatwootConfig } = await import('../../features/support/config');
    const config = resolveChatwootConfig(process.env);
    expect(config.enabled).toBe(false);
    if (!config.enabled) {
      expect(config.reason).toBe('missing_config');
    }
  });

  it('rejects non-HTTPS URLs', async () => {
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_ENABLED', 'true');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_BASE_URL', 'http://chat.example.com');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN', 'website-token');
    const { resolveChatwootConfig } = await import('../../features/support/config');
    const config = resolveChatwootConfig(process.env);
    expect(config.enabled).toBe(false);
    if (!config.enabled) {
      expect(config.reason).toBe('invalid_url');
    }
  });

  it('rejects invalid URL strings', async () => {
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_ENABLED', 'true');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_BASE_URL', 'not-a-url');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN', 'website-token');
    const { resolveChatwootConfig } = await import('../../features/support/config');
    const config = resolveChatwootConfig(process.env);
    expect(config.enabled).toBe(false);
    if (!config.enabled) {
      expect(config.reason).toBe('invalid_url');
    }
  });

  it('returns enabled config for valid HTTPS + token', async () => {
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_ENABLED', 'true');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_BASE_URL', 'https://app.chatwoot.com/');
    vi.stubEnv('EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN', 'website-token');
    const { resolveChatwootConfig } = await import('../../features/support/config');
    const config = resolveChatwootConfig(process.env);
    expect(config).toEqual({
      enabled: true,
      baseUrl: 'https://app.chatwoot.com',
      websiteToken: 'website-token',
    });
  });
});
