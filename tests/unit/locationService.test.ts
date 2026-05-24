import { describe, expect, it } from 'vitest';

import { distanceInMeters } from '../../lib/geo/distance';

describe('locationService', () => {
  it('returns zero distance for identical coordinates', () => {
    const point = { latitude: 13.7563, longitude: 100.5018 };
    expect(distanceInMeters(point, point)).toBe(0);
  });

  it('measures roughly 111 km per degree of latitude', () => {
    const bangkok = { latitude: 13.7563, longitude: 100.5018 };
    const oneDegreeNorth = { latitude: 14.7563, longitude: 100.5018 };
  const meters = distanceInMeters(bangkok, oneDegreeNorth);

    expect(meters).toBeGreaterThan(110_000);
    expect(meters).toBeLessThan(112_000);
  });

  it('detects movement greater than 50 meters', () => {
    const start = { latitude: 13.7563, longitude: 100.5018 };
    const moved = { latitude: 13.7568, longitude: 100.5018 };

    expect(distanceInMeters(start, moved)).toBeGreaterThan(50);
  });
});
