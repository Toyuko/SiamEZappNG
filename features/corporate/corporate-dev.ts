import { ApiError } from '../../lib/api';

/**
 * Store/release builds set `__DEV__ === false`. In that case mocks are blocked unless
 * `EXPO_PUBLIC_ALLOW_MOCKS=true` (must never be set on EAS production).
 */
function mocksAllowedInThisBuild() {
  if (process.env.EXPO_PUBLIC_ALLOW_MOCKS === 'true') {
    return true;
  }
  if (typeof __DEV__ !== 'undefined' && __DEV__ === false) {
    return false;
  }
  return true;
}

export function shouldUseCorporateMock() {
  if (!mocksAllowedInThisBuild()) {
    return false;
  }
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
