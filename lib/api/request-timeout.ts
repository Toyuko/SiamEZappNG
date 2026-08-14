export const API_REQUEST_TIMEOUT_MS = 15_000;

export function createTimeoutSignal(ms = API_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, ms);
  return {
    signal: controller.signal,
    cancel() {
      clearTimeout(timer);
    },
  };
}

export function isAbortError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const name = 'name' in error ? String(error.name) : '';
  return name === 'AbortError' || name === 'TimeoutError';
}
