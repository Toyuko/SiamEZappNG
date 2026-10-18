export type ChatwootConfig =
  | {
      enabled: true;
      baseUrl: string;
      websiteToken: string;
    }
  | {
      enabled: false;
      reason: 'disabled' | 'missing_config' | 'invalid_url';
      message: string;
    };

function trimEnv(value: string | undefined): string {
  return (value ?? '').trim();
}

function isTruthyFlag(value: string | undefined): boolean {
  const normalized = trimEnv(value).toLowerCase();
  if (!normalized) {
    // Default: enabled when URL + token are present (local/EAS can omit the flag).
    return true;
  }
  return normalized !== 'false' && normalized !== '0' && normalized !== 'off' && normalized !== 'no';
}

/**
 * Validate Chatwoot client configuration.
 * Website token is intentional for the public widget; never accept Admin/API secrets here.
 */
export function resolveChatwootConfig(env: NodeJS.ProcessEnv = process.env): ChatwootConfig {
  if (!isTruthyFlag(env.EXPO_PUBLIC_CHATWOOT_ENABLED)) {
    return {
      enabled: false,
      reason: 'disabled',
      message: 'Chatwoot support is disabled.',
    };
  }

  const baseUrlRaw = trimEnv(env.EXPO_PUBLIC_CHATWOOT_BASE_URL);
  const websiteToken = trimEnv(env.EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN);

  if (!baseUrlRaw || !websiteToken) {
    return {
      enabled: false,
      reason: 'missing_config',
      message: 'Chatwoot is not configured.',
    };
  }

  const baseUrl = baseUrlRaw.replace(/\/+$/, '');
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    return {
      enabled: false,
      reason: 'invalid_url',
      message: 'Chatwoot base URL is invalid.',
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      enabled: false,
      reason: 'invalid_url',
      message: 'Chatwoot base URL must use HTTPS.',
    };
  }

  return {
    enabled: true,
    baseUrl,
    websiteToken,
  };
}

export function isChatwootEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return resolveChatwootConfig(env).enabled;
}
