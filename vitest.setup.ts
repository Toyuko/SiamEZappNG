import { vi } from 'vitest';

globalThis.fetch = vi.fn() as unknown as typeof fetch;
