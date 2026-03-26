import { appConfig } from './config';
import { removeToken, getToken } from './auth/token';
import { useAuthStore } from '../store/auth-store';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type RequestOptions = {
  tokenOverride?: string | null;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const wrapped = payload as ApiEnvelope<T>;
    if (wrapped.data !== undefined) {
      return wrapped.data;
    }
  }
  return payload as T;
}

function joinUrl(base: string, path: string) {
  const normalizedBase = base.replace(/\/+$/, '');
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Guard against accidental "/api/api/*" duplication if base already ends with /api.
  if (normalizedBase.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.slice('/api'.length);
  }

  return `${normalizedBase}${normalizedPath}`;
}

async function logoutForUnauthorized() {
  await removeToken();
  useAuthStore.getState().clearSession();
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

async function request<T>(method: HttpMethod, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  const token = options?.tokenOverride !== undefined ? options.tokenOverride : await getToken();
  const url = joinUrl(appConfig.apiUrl, path);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body;
      // NOTE: do not set Content-Type for FormData; fetch will add correct boundary.
    } else {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(message, 0, null);
  }

  const data = await parseResponseBody(response);

  if (response.status === 401) {
    await logoutForUnauthorized();
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data && 'message' in (data as any) && typeof (data as any).message === 'string'
        ? (data as any).message
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, undefined, options),
};

