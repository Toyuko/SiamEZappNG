import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/api', () => ({
  ApiError: class ApiError extends Error {
    status: number;
    data: unknown;
    constructor(message: string, status = 0, data: unknown = null) {
      super(message);
      this.status = status;
      this.data = data;
    }
  },
}));

describe('freelancer mock protection', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('blocks mocks in store release builds even if the mock env flag is set', async () => {
    vi.stubGlobal('__DEV__', false);
    vi.stubEnv('EXPO_PUBLIC_FREELANCER_MOCK', 'true');
    vi.stubEnv('EXPO_PUBLIC_ALLOW_MOCKS', 'false');
    vi.resetModules();
    const { shouldUseFreelancerMock } = await import('../../features/freelancer/freelancer-dev');
    expect(shouldUseFreelancerMock()).toBe(false);
  });

  it('allows mocks in release only when EXPO_PUBLIC_ALLOW_MOCKS=true', async () => {
    vi.stubGlobal('__DEV__', false);
    vi.stubEnv('EXPO_PUBLIC_FREELANCER_MOCK', 'true');
    vi.stubEnv('EXPO_PUBLIC_ALLOW_MOCKS', 'true');
    vi.resetModules();
    const { shouldUseFreelancerMock } = await import('../../features/freelancer/freelancer-dev');
    expect(shouldUseFreelancerMock()).toBe(true);
  });
});
