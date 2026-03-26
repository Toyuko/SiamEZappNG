const DEFAULT_WEB_BASE_URL = 'https://siam-e-zweb-ng.vercel.app';

export const appConfig = {
  // Support both names while we transition env keys.
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_WEB_BASE_URL,
  webBaseUrl: process.env.EXPO_PUBLIC_WEB_BASE_URL ?? DEFAULT_WEB_BASE_URL,
  appName: 'SiamEZ',
};
