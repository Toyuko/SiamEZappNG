import { appConfig } from './config';
import { getToken } from './auth/token';
import { isPublicAuthPath } from './auth/public-auth-path';
import { createTimeoutSignal, isAbortError } from './api/request-timeout';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  tokenOverride?: string | null;
  timeoutMs?: number;
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

function looksLikeApiEnvelope(payload: Record<string, unknown>) {
  return typeof payload.success === 'boolean' || payload.error !== undefined;
}

export function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const wrapped = payload as ApiEnvelope<T>;
    if (wrapped.success === true) {
      if (wrapped.data !== undefined) {
        return wrapped.data;
      }
      return payload as T;
    }
    if (wrapped.data !== undefined && looksLikeApiEnvelope(wrapped as Record<string, unknown>)) {
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

function getErrorMessage(data: unknown, status: number) {
  if (typeof data === 'string' && data.trim().length > 0) {
    const trimmed = data.trim();
    if (trimmed.startsWith('<!') || trimmed.includes('<html')) {
      if (status === 404) {
        return 'This page could not be found. The server may need an update.';
      }
      return `Request failed (${status})`;
    }
    if (trimmed.length > 240) {
      return `${trimmed.slice(0, 240)}…`;
    }
    return trimmed;
  }

  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    const directKeys = ['message', 'error', 'detail'];
    for (const key of directKeys) {
      const value = body[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    const errors = body.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0];
      if (typeof first === 'string' && first.trim().length > 0) {
        return first;
      }
      if (first && typeof first === 'object') {
        const nested = first as Record<string, unknown>;
        if (typeof nested.message === 'string' && nested.message.trim().length > 0) {
          return nested.message;
        }
      }
    }
  }

  return `Request failed (${status})`;
}

async function request<T>(method: HttpMethod, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  const skipAuthHeader = isPublicAuthPath(path);
  const token = skipAuthHeader
    ? null
    : options?.tokenOverride !== undefined
      ? options.tokenOverride
      : await getToken();
  const url = joinUrl(appConfig.apiUrl, path);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const timeout = createTimeoutSignal(options?.timeoutMs);
  const init: RequestInit = {
    method,
    headers,
    signal: timeout.signal,
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
    if (isAbortError(err)) {
      throw new ApiError('Request timed out. Please try again.', 0, null);
    }
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(message, 0, null);
  } finally {
    timeout.cancel();
  }

  const data = await parseResponseBody(response);

  if (response.status === 401 && Boolean(token) && !skipAuthHeader) {
    const { endSession } = await import('./session/end-session');
    await endSession();
  }

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const suffix = retryAfter ? ` Retry after ${retryAfter}s.` : '';
      throw new ApiError(`Too many requests.${suffix}`, 429, data);
    }
    const message = getErrorMessage(data, response.status);
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, undefined, options),
};

