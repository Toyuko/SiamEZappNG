import { describe, expect, it } from 'vitest';

import { fuzzySearchServices, resolveVoiceIntent } from '../../features/services/service-search';

describe('fuzzySearchServices', () => {
  it('returns all services for empty query', () => {
    expect(fuzzySearchServices('')).toHaveLength(10);
  });

  it('matches title with typos', () => {
    const results = fuzzySearchServices('marige');
    expect(results.some((item) => item.slug === 'marriage-registration')).toBe(true);
  });

  it('matches category', () => {
    const results = fuzzySearchServices('Mobility');
    expect(results.every((item) => item.category === 'Mobility')).toBe(true);
  });

  it('matches keyword aliases', () => {
    const results = fuzzySearchServices('airport transfer');
    expect(results.some((item) => item.slug === 'transportation-services')).toBe(true);
  });
});

describe('resolveVoiceIntent', () => {
  it('routes directly for a clear service phrase', () => {
    const intent = resolveVoiceIntent("driver's license");
    expect(intent.type).toBe('direct');
    if (intent.type === 'direct') {
      expect(intent.service.slug).toBe('driver-license');
    }
  });

  it('routes directly for vehicle registration', () => {
    const intent = resolveVoiceIntent('vehicle registration');
    expect(intent.type).toBe('direct');
    if (intent.type === 'direct') {
      expect(intent.service.slug).toBe('vehicle-registration');
    }
  });

  it('falls back to ambiguous results for broad queries', () => {
    const intent = resolveVoiceIntent('help with documents');
    expect(intent.type).toBe('ambiguous');
    if (intent.type === 'ambiguous') {
      expect(intent.results.length).toBeGreaterThan(0);
    }
  });
});
