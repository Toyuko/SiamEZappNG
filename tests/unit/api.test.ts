import { beforeEach, describe, expect, it, vi } from 'vitest';

const removeTokenMock = vi.fn();
const getTokenMock = vi.fn();
const endSessionMock = vi.fn();

vi.mock('../../lib/config', () => ({
  appConfig: { apiUrl: 'https://example.com/api' },
}));

vi.mock('../../lib/auth/token', () => ({
  getToken: getTokenMock,
  removeToken: removeTokenMock,
}));

vi.mock('../../lib/session/end-session', () => ({
  endSession: (...args: unknown[]) => endSessionMock(...args),
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

  it('throws ApiError and ends session on 401 when a token was sent', async () => {
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
    expect(endSessionMock).toHaveBeenCalledTimes(1);
  });

  it('does not end session on 401 when no token was sent', async () => {
    getTokenMock.mockResolvedValue(null);
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 401,
        body: { error: 'Unauthorized' },
      }),
    );

    const { api, ApiError } = await import('../../lib/api');
    await expect(api.get('/api/documents/upload')).rejects.toBeInstanceOf(ApiError);
    expect(endSessionMock).not.toHaveBeenCalled();
  });

  it('does not send Authorization or end session on login 401', async () => {
    getTokenMock.mockResolvedValue('stale-token');
    vi.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse({
        ok: false,
        status: 401,
        body: { error: 'Invalid credentials' },
      }),
    );

    const { api, ApiError } = await import('../../lib/api');
    await expect(api.post('/api/auth/login', { email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(ApiError);
    expect(endSessionMock).not.toHaveBeenCalled();
    const [, init] = vi.mocked(global.fetch).mock.calls[0];
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
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
    await expect(api.get('/api/cases')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'network down',
    });
  });

  it('times out hung requests', async () => {
    getTokenMock.mockResolvedValue(null);
    vi.mocked(global.fetch).mockImplementation((_url, init) => {
      return new Promise((_, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });
    });

    const { api, ApiError } = await import('../../lib/api');
    await expect(api.get('/api/cases', { timeoutMs: 20 })).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'Request timed out. Please try again.',
    });
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
    expect(unwrapApiData({ success: true, data: { id: 1 } })).toEqual({ id: 1 });
    expect(unwrapApiData({ data: { id: 1 } })).toEqual({ data: { id: 1 } });
  });
});
