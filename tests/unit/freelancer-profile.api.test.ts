import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();
const putMock = vi.fn();
const postMock = vi.fn();

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
  unwrapApiData: <T>(value: T) => {
    if (value && typeof value === 'object' && 'data' in (value as object)) {
      return (value as unknown as { data: T }).data;
    }
    return value;
  },
  api: { get: getMock, put: putMock, post: postMock },
}));

describe('freelancer profile api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('lists public freelancers with query params', async () => {
    const { getPublicFreelancers } = await import('../../features/freelancer/freelancer-profile.api');
    getMock.mockResolvedValueOnce({
      success: true,
      data: { items: [], total: 0, page: 1, pageSize: 12 },
    });

    const result = await getPublicFreelancers({ q: 'visa', skill: 'Translation', page: 2, pageSize: 12 });
    expect(getMock).toHaveBeenCalledWith('/api/freelancers?q=visa&skill=Translation&page=2&pageSize=12');
    expect(result.total).toBe(0);
  });

  it('fetches a public freelancer by slug', async () => {
    const { getPublicFreelancerBySlug } = await import('../../features/freelancer/freelancer-profile.api');
    getMock.mockResolvedValueOnce({
      success: true,
      data: {
        id: '1',
        slug: 'sam-freelancer',
        title: 'Specialist',
        bio: null,
        skills: [],
        hourlyRate: 80000,
        averageRating: 4.8,
        totalReviews: 0,
        verificationStatus: 'verified',
        isSpecialMember: false,
        services: [],
        createdAt: '2026-05-15T10:37:54.750Z',
        user: { id: 'u1', name: 'Sam', image: null },
      },
    });

    const profile = await getPublicFreelancerBySlug('Sam-Freelancer');
    expect(getMock).toHaveBeenCalledWith('/api/freelancers/sam-freelancer');
    expect(profile.slug).toBe('sam-freelancer');
  });

  it('updates owner profile via PUT /api/freelancer/me', async () => {
    const { updateMyFreelancerProfile } = await import('../../features/freelancer/freelancer-profile.api');
    putMock.mockResolvedValueOnce({
      success: true,
      data: {
        profile: {
          id: '1',
          slug: 'sam-freelancer',
          isPublic: true,
        },
      },
    });

    await updateMyFreelancerProfile({
      slug: 'sam-freelancer',
      isPublic: true,
      title: 'Specialist',
      skills: ['Visa support'],
      hourlyRate: 80000,
      services: [],
    });

    expect(putMock).toHaveBeenCalledWith('/api/freelancer/me', {
      slug: 'sam-freelancer',
      isPublic: true,
      title: 'Specialist',
      skills: ['Visa support'],
      hourlyRate: 80000,
      services: [],
    });
  });

  it('falls back to mock directory when mock mode is enabled', async () => {
    vi.stubEnv('EXPO_PUBLIC_FREELANCER_MOCK', 'true');
    const { getPublicFreelancers } = await import('../../features/freelancer/freelancer-profile.api');
    getMock.mockRejectedValueOnce(new MockApiError('offline', 0, null));

    const result = await getPublicFreelancers({ q: 'relocation' });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.slug).toBe('sam-freelancer');
    vi.unstubAllEnvs();
  });
});

describe('freelancer slug helpers', () => {
  it('normalizes and validates slugs', async () => {
    const { normalizeFreelancerSlug, getFreelancerSlugError, isValidFreelancerSlug } = await import(
      '../../features/freelancer/freelancer-slug'
    );

    expect(normalizeFreelancerSlug(' Sam Freelancer! ')).toBe('sam-freelancer');
    expect(isValidFreelancerSlug('sam-freelancer')).toBe(true);
    expect(getFreelancerSlugError('ab')).toContain('at least 3');
    expect(getFreelancerSlugError('admin')).toContain('reserved');
  });
});
