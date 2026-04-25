import { beforeEach, describe, expect, it, vi } from 'vitest';

const removeTokenMock = vi.fn();
const getTokenMock = vi.fn();
const clearSessionMock = vi.fn();

vi.mock('../../lib/config', () => ({
  appConfig: { apiUrl: 'https://example.com/api' },
}));

vi.mock('../../lib/auth/token', () => ({
  getToken: getTokenMock,
  removeToken: removeTokenMock,
}));

vi.mock('../../store/auth-store', () => ({
  useAuthStore: {
    getState: () => ({
      clearSession: clearSessionMock,
    }),
  },
}));

function mockResponse({
  ok = true,
  status = 200,
  contentType = 'application/json',
  body = {},
}: {
  ok?: boolean;
  status?: number;
  contentType?: string;
  body?: unknown;
}) {
  return {
    ok,
    status,
    headers: { get: () => contentType },
    json: vi.fn(async () => body),
    text: vi.fn(async () => String(body)),
  } as unknown as Response;
}

describe('lib/api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('uses normalized URL and bearer token on GET', async () => {
    getTokenMock.mockResolvedValue('token-123');
    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse({ body: { ok: true } }));

    const { api } = await import('../../lib/api');
    await api.get('/api/auth/me');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api/auth/me',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
      }),
    );
  });

  it('throws ApiError and logs user out on 401', async () => {
    getTokenMock.mockResolvedValue('expired-token');
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 401,
        body: { error: { message: 'Token expired' } },
      }),
    );

    const { api, ApiError } = await import('../../lib/api');
    await expect(api.get('/api/cases')).rejects.toBeInstanceOf(ApiError);
    expect(removeTokenMock).toHaveBeenCalledTimes(1);
    expect(clearSessionMock).toHaveBeenCalledTimes(1);
  });

  it('uses token override and skips token lookup', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse({ body: { ok: true } }));
    const { api } = await import('../../lib/api');
    await api.get('/api/auth/me', { tokenOverride: 'override-token' });

    expect(getTokenMock).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer override-token' }),
      }),
    );
  });

  it('keeps FormData content-type untouched', async () => {
    getTokenMock.mockResolvedValue(null);
    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse({ body: { success: true } }));
    const formData = new FormData();
    formData.append('file', new Blob(['x']), 'a.txt');

    const { api } = await import('../../lib/api');
    await api.post('/api/documents/upload', formData);

    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();
  });

  it('throws status 0 ApiError on network failures', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('network down'));
    const { api, ApiError } = await import('../../lib/api');
    await expect(api.get('/api/cases')).rejects.toEqual(
      expect.objectContaining({
        name: 'ApiError',
        status: 0,
        message: 'network down',
      } satisfies Partial<ApiError>),
    );
  });

  it('extracts nested error messages and unwrap helper returns payload fallback', async () => {
    getTokenMock.mockResolvedValue(null);
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 400,
        body: { errors: [{ message: 'First validation error' }] },
      }),
    );
    const { api, unwrapApiData } = await import('../../lib/api');
    await expect(api.post('/api/payments', {})).rejects.toThrow('First validation error');
    expect(unwrapApiData({ success: true })).toEqual({ success: true });
  });
});
