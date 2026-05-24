import { ApiError } from '../../lib/api';

export function shouldUseFreelancerMock() {
  return process.env.EXPO_PUBLIC_FREELANCER_MOCK === 'true';
}

const isDevBuild = typeof __DEV__ !== 'undefined' && __DEV__;

export function shouldFallbackToFreelancerMock(error: unknown) {
  if (shouldUseFreelancerMock()) {
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
