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

describe('features/auth/auth.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes email and falls back login path on 404', async () => {
    const { loginWithEmail } = await import('../../features/auth/auth.api');
    postMock
      .mockRejectedValueOnce(new MockApiError('not found', 404, null))
      .mockResolvedValueOnce({ token: 'abc', user: { id: 'u1', email: 'me@example.com' } });

    const result = await loginWithEmail({ email: '  Me@Example.com ', password: 'secret' });
    expect(postMock).toHaveBeenNthCalledWith(1, '/api/auth/login', { email: 'me@example.com', password: 'secret' });
    expect(postMock).toHaveBeenNthCalledWith(2, '/auth/login', { email: 'me@example.com', password: 'secret' });
    expect(result.token).toBe('abc');
  });

  it('maps legacy accessToken response shape', async () => {
    const { loginWithEmail } = await import('../../features/auth/auth.api');
    postMock.mockResolvedValueOnce({ accessToken: 'legacy', user: { id: 'u1', email: 'me@example.com' } });
    await expect(loginWithEmail({ email: 'me@example.com', password: '12345678' })).resolves.toEqual({
      token: 'legacy',
      user: { id: 'u1', email: 'me@example.com' },
    });
  });

  it('rejects signup when API returns a hard error', async () => {
    const { signUpWithEmail } = await import('../../features/auth/auth.api');
    postMock.mockRejectedValueOnce(new MockApiError('bad', 400, 'Bad Request'));
    await expect(signUpWithEmail({ name: 'A', email: 'a@example.com', password: '12345678' })).rejects.toThrow();
  });

  it('falls back getMe to legacy endpoint on 404', async () => {
    const { getMe } = await import('../../features/auth/auth.api');
    getMock
      .mockRejectedValueOnce(new MockApiError('not found', 404, null))
      .mockResolvedValueOnce({ id: 'u1', email: 'u@example.com' });
    const me = await getMe('override-token');
    expect(getMock).toHaveBeenNthCalledWith(1, '/api/auth/me', { tokenOverride: 'override-token' });
    expect(getMock).toHaveBeenNthCalledWith(2, '/auth/me', { tokenOverride: 'override-token' });
    expect(me.id).toBe('u1');
  });

  it('tries multiple attach-guest paths until success', async () => {
    const { attachGuestCasesToUser } = await import('../../features/auth/auth.api');
    postMock
      .mockRejectedValueOnce(new MockApiError('missing', 404, null))
      .mockRejectedValueOnce(new MockApiError('missing', 404, null))
      .mockResolvedValueOnce({ ok: true });
    await attachGuestCasesToUser('valid@example.com', 'user-1');
    expect(postMock).toHaveBeenCalledTimes(3);
  });
});
