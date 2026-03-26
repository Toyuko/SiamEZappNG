import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'siamez_jwt';

let inMemoryToken: string | null | undefined;

export async function setToken(token: string) {
  inMemoryToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  if (inMemoryToken !== undefined) {
    return inMemoryToken;
  }
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  inMemoryToken = token;
  return token;
}

export async function removeToken() {
  inMemoryToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

