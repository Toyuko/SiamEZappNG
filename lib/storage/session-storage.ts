import { getToken, removeToken, setToken } from '../auth/token';

// Backwards-compatible wrappers (legacy name).
export async function saveAccessToken(token: string) {
  await setToken(token);
}

export async function getAccessToken() {
  return getToken();
}

export async function clearAccessToken() {
  await removeToken();
}
