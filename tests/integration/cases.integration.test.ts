import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/config', () => ({
  appConfig: { apiUrl: 'https://example.com' },
}));
vi.mock('../../lib/auth/token', () => ({
  getToken: vi.fn(async () => null),
  removeToken: vi.fn(async () => undefined),
}));
vi.mock('../../store/auth-store', () => ({
  useAuthStore: { getState: () => ({ clearSession: vi.fn() }) },
}));

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: vi.fn(async () => body),
    text: vi.fn(async () => JSON.stringify(body)),
  } as unknown as Response;
}

describe('cases API integration', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it('unwraps envelope data and encodes case id', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(jsonResponse({ data: { id: 'abc', title: 'Case Title' } }));
    const { getCaseById } = await import('../../features/cases/cases.api');
    const result = await getCaseById('A/B C');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api/cases/A%2FB%20C',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual({ id: 'abc', title: 'Case Title' });
  });
});
