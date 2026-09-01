import { describe, expect, it } from 'vitest';

import { parseJobDescription } from '../../features/matching/matching.parser';

describe('parseJobDescription', () => {
  it('extracts a Vespa mechanic request in Bangkok', () => {
    const parsed = parseJobDescription(
      'I need someone to fix my Vespa GTS 300 in Bangkok tomorrow. I can pay around 15,000 baht.',
    );
    expect(parsed.category).toBe('motorbike_mechanic');
    expect(parsed.location).toBe('Bangkok');
    expect(parsed.vehicle?.toLowerCase()).toContain('vespa');
    expect(parsed.budgetMax).toBe(15_000);
    expect(parsed.skills).toContain('Vespa');
    expect(parsed.urgency).toBe('today');
    expect(parsed.confidence).toBeGreaterThan(0.5);
  });

  it('extracts an interpreter request in Chiang Mai', () => {
    const parsed = parseJobDescription('Need an English/Thai interpreter in Chiang Mai this week.');
    expect(parsed.category).toBe('interpreter');
    expect(parsed.location).toBe('Chiang Mai');
    expect(parsed.languages).toEqual(expect.arrayContaining(['English', 'Thai']));
    expect(parsed.urgency).toBe('this_week');
  });

  it('returns low confidence when nothing is recognized', () => {
    const parsed = parseJobDescription('asdf qwerty');
    expect(parsed.category).toBeNull();
    expect(parsed.location).toBeNull();
    expect(parsed.budgetMax).toBeNull();
  });
});
