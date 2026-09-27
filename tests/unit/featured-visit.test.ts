import { describe, expect, it, beforeEach } from 'vitest';

import {
  buildFeaturedVisit,
  getLastFeaturedSlug,
  nextFeaturedVisit,
  orderCatalogForVisit,
  resetFeaturedVisitMemory,
} from '../../features/services/featured-visit';

const catalog = [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }, { slug: 'd' }];

describe('buildFeaturedVisit', () => {
  it('returns an empty list when there are no services', () => {
    expect(buildFeaturedVisit([], 'a', () => 0)).toEqual([]);
  });

  it('keeps the only service even when it was just shown', () => {
    expect(buildFeaturedVisit([{ slug: 'only' }], 'only', () => 0)).toEqual([{ slug: 'only' }]);
  });

  it('does not mutate the input', () => {
    const input = [{ slug: 'a' }, { slug: 'b' }];
    const snapshot = [...input];
    buildFeaturedVisit(input, null, () => 0.9);
    expect(input).toEqual(snapshot);
  });

  it('puts a non-repeated service first and keeps every service', () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const ordered = buildFeaturedVisit(catalog, 'a');
      expect(ordered[0]?.slug).not.toBe('a');
      expect(ordered.map((item) => item.slug).sort()).toEqual(['a', 'b', 'c', 'd']);
    }
  });

  it('uses the injected random source to choose the featured service', () => {
    const ordered = buildFeaturedVisit(catalog, 'a', () => 0);
    expect(ordered[0]?.slug).toBe('b');
    expect(new Set(ordered.map((item) => item.slug))).toEqual(new Set(['a', 'b', 'c', 'd']));
  });
});

describe('orderCatalogForVisit', () => {
  it('features a service from the visible subset', () => {
    const ordered = orderCatalogForVisit(catalog, {
      visibleSlugs: new Set(['c', 'd']),
      avoidSlug: null,
      random: () => 0,
    });
    expect(ordered[0]?.slug).toBe('c');
    expect(ordered.map((item) => item.slug).sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('returns the catalog unchanged when the visible set is empty', () => {
    expect(
      orderCatalogForVisit(catalog, { visibleSlugs: new Set(), avoidSlug: 'a', random: () => 0 }).map(
        (item) => item.slug,
      ),
    ).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('nextFeaturedVisit', () => {
  beforeEach(() => {
    resetFeaturedVisitMemory();
  });

  it('avoids the previous featured service on the next visit', () => {
    const first = nextFeaturedVisit(catalog, null, () => 0);
    expect(first[0]?.slug).toBe('a');
    expect(getLastFeaturedSlug()).toBe('a');

    const second = nextFeaturedVisit(catalog, null, () => 0);
    expect(second[0]?.slug).not.toBe('a');
    expect(second).toHaveLength(catalog.length);
  });

  it('does not replace the remembered service when nothing is visible', () => {
    nextFeaturedVisit(catalog, null, () => 0);
    nextFeaturedVisit(catalog, new Set(), () => 0.99);
    expect(getLastFeaturedSlug()).toBe('a');
  });

  it('stays on the only available service', () => {
    expect(nextFeaturedVisit([{ slug: 'only' }])).toEqual([{ slug: 'only' }]);
    expect(nextFeaturedVisit([{ slug: 'only' }])).toEqual([{ slug: 'only' }]);
  });

  it('returns an empty visit before the catalog has loaded', () => {
    expect(nextFeaturedVisit([])).toEqual([]);
    expect(getLastFeaturedSlug()).toBeNull();
  });
});
