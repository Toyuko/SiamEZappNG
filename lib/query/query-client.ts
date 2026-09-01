import { QueryClient } from '@tanstack/react-query';

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 20_000,
        retry: 1,
      },
    },
  });
}

let appQueryClient: QueryClient | null = null;

export function getAppQueryClient() {
  if (!appQueryClient) {
    appQueryClient = createAppQueryClient();
  }
  return appQueryClient;
}

/** Test helper — do not use in app code. */
export function resetAppQueryClientForTests() {
  appQueryClient?.clear();
  appQueryClient = null;
}
