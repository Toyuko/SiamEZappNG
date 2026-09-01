const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/auth/login',
  '/api/auth/register',
  '/auth/register',
  '/api/auth/oauth/exchange',
  '/auth/oauth/exchange',
];

export function isPublicAuthPath(path: string) {
  const normalized = path.split('?')[0] ?? path;
  return PUBLIC_AUTH_PATHS.some((candidate) => normalized === candidate || normalized.endsWith(candidate));
}
