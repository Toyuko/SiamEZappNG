import { ApiError } from '../../lib/api';

export function shouldUseCorporateMock() {
  return process.env.EXPO_PUBLIC_CORPORATE_MOCK === 'true';
}

const isDevBuild = typeof __DEV__ !== 'undefined' && __DEV__;

export function shouldFallbackToCorporateMock(error: unknown) {
  if (shouldUseCorporateMock()) {
    return true;
  }
  if (!isDevBuild) {
    return false;
  }
  if (error instanceof ApiError) {
    return error.status === 404 || error.status === 0;
  }
  return false;
}
