import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'siamez_jwt';

let inMemoryToken: string | null | undefined;

async function safeSecureStore(
  action: () => Promise<string | null | void>,
): Promise<string | null | void> {
  try {
    return await action();
  } catch {
    // expo-secure-store has no web implementation; memory cache still works for the session.
    return null;
  }
}

export async function setToken(token: string) {
  inMemoryToken = token;
  await safeSecureStore(() => SecureStore.setItemAsync(TOKEN_KEY, token));
}

export async function getToken() {
  if (inMemoryToken !== undefined) {
    return inMemoryToken;
  }
  const token = (await safeSecureStore(() => SecureStore.getItemAsync(TOKEN_KEY))) as
    | string
    | null;
  inMemoryToken = token;
  return token;
}

export async function removeToken() {
  inMemoryToken = null;
  await safeSecureStore(() => SecureStore.deleteItemAsync(TOKEN_KEY));
}
