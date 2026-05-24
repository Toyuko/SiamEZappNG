import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();
const getMock = vi.fn();

class MockApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

vi.mock('../../lib/api', () => ({
  ApiError: MockApiError,
  unwrapApiData: <T>(value: T) => value,
  api: { post: postMock, get: getMock },
}));

describe('freelancer api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falls back to mock dashboard when mock mode is enabled', async () => {
    vi.stubEnv('EXPO_PUBLIC_FREELANCER_MOCK', 'true');
    const { getFreelancerDashboard } = await import('../../features/freelancer/freelancer.api');
    const { getFreelancerMockDashboard } = await import('../../features/freelancer/freelancer-mock-runtime');
    getMock.mockRejectedValueOnce(new MockApiError('not found', 404, null));

    const dashboard = await getFreelancerDashboard();
    expect(dashboard.openJobs.length).toBe(getFreelancerMockDashboard().openJobs.length);
    vi.unstubAllEnvs();
  });

  it('updates mock state when accept uses mock mode', async () => {
    vi.stubEnv('EXPO_PUBLIC_FREELANCER_MOCK', 'true');
    const { acceptFreelancerJob, getFreelancerDashboard } = await import('../../features/freelancer/freelancer.api');
    const { resetFreelancerMockRuntime } = await import('../../features/freelancer/freelancer-mock-runtime');
    resetFreelancerMockRuntime();

    postMock.mockRejectedValueOnce(new MockApiError('not found', 404, null));
    await acceptFreelancerJob('job-open-1');

    getMock.mockRejectedValueOnce(new MockApiError('not found', 404, null));
    const dashboard = await getFreelancerDashboard();
    expect(dashboard.openJobs.some((job) => job.id === 'job-open-1')).toBe(false);
    expect(dashboard.activeJobs.some((job) => job.id === 'job-open-1' && job.status === 'in_progress')).toBe(true);
    vi.unstubAllEnvs();
  });

  it('marks job complete via web-aligned endpoint', async () => {
    const { markFreelancerJobComplete } = await import('../../features/freelancer/freelancer.api');
    postMock.mockResolvedValueOnce({
      ok: true,
      completionSubmittedAt: '2026-05-15T10:00:00.000Z',
    });

    const result = await markFreelancerJobComplete('job-101');
    expect(postMock).toHaveBeenCalledWith('/api/freelancer/jobs/job-101/complete');
    expect(result.completionSubmittedAt).toBeTruthy();
  });
});
