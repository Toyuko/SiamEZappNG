export type OAuthRedirectResult = {
  code: string | null;
  accessToken: string | null;
};

function firstParam(params: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = params.get(key);
    if (value?.trim()) {
      return value.trim();
    }
  }
  return null;
}

/**
 * Reads an OAuth redirect without logging the URL.
 * Prefers an authorization `code` (to exchange server-side) over a token in the query string.
 */
export function parseOAuthRedirect(url: string): OAuthRedirectResult {
  const parsed = new URL(url);
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const queryParams = parsed.searchParams;

  const code = firstParam(queryParams, ['code']) ?? firstParam(hashParams, ['code']);
  const accessToken =
    firstParam(hashParams, ['access_token', 'accessToken']) ??
    firstParam(queryParams, ['access_token', 'accessToken']);

  return { code, accessToken };
}
