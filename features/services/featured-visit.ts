type SlugItem = { slug: string };

let lastFeaturedSlug: string | null = null;

function clampIndex(length: number, random: () => number): number {
  if (length <= 1) {
    return 0;
  }
  const raw = random();
  const scaled = Number.isFinite(raw) ? raw : 0;
  return Math.min(length - 1, Math.max(0, Math.floor(scaled * length)));
}

function shuffleWith<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = clampIndex(index + 1, random);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

/**
 * Orders `pool` so a random item is first.
 * When another item exists, the first item is not `avoidSlug`.
 */
export function buildFeaturedVisit<T extends SlugItem>(
  pool: readonly T[],
  avoidSlug: string | null,
  random: () => number = Math.random,
): T[] {
  if (pool.length <= 1) {
    return [...pool];
  }

  const eligible = pool.filter((item) => item.slug !== avoidSlug);
  const candidates = eligible.length > 0 ? eligible : [...pool];
  const featured = candidates[clampIndex(candidates.length, random)];
  const rest = shuffleWith(
    pool.filter((item) => item.slug !== featured.slug),
    random,
  );
  return [featured, ...rest];
}

/**
 * Builds a visit order for the full catalog.
 * The featured item is chosen from `visibleSlugs` when that set is non-empty,
 * so a category or search filter still starts on a service the user can see.
 * Other catalog items keep their relative order after the featured group.
 */
export function orderCatalogForVisit<T extends SlugItem>(
  catalog: readonly T[],
  options?: {
    visibleSlugs?: ReadonlySet<string> | null;
    avoidSlug?: string | null;
    random?: () => number;
  },
): T[] {
  if (catalog.length === 0) {
    return [];
  }

  const random = options?.random ?? Math.random;
  const visibleSlugs = options?.visibleSlugs;
  const pool =
    visibleSlugs == null ? [...catalog] : catalog.filter((item) => visibleSlugs.has(item.slug));

  if (pool.length === 0) {
    return [...catalog];
  }

  const featuredOrder = buildFeaturedVisit(pool, options?.avoidSlug ?? null, random);
  const used = new Set(featuredOrder.map((item) => item.slug));
  const remainder = catalog.filter((item) => !used.has(item.slug));
  return [...featuredOrder, ...remainder];
}

/**
 * In-memory only. Survives leaving the Services screen, and resets when the app process restarts.
 * An empty visible set does not change the remembered service, because nothing new was shown.
 */
export function nextFeaturedVisit<T extends SlugItem>(
  catalog: readonly T[],
  visibleSlugs: ReadonlySet<string> | null = null,
  random: () => number = Math.random,
): T[] {
  if (catalog.length === 0) {
    return [];
  }

  if (visibleSlugs != null && visibleSlugs.size === 0) {
    return orderCatalogForVisit(catalog, { avoidSlug: lastFeaturedSlug, random });
  }

  const ordered = orderCatalogForVisit(catalog, {
    visibleSlugs,
    avoidSlug: lastFeaturedSlug,
    random,
  });
  const shown = ordered[0];
  if (shown && (visibleSlugs == null || visibleSlugs.has(shown.slug))) {
    lastFeaturedSlug = shown.slug;
  }
  return ordered;
}

export function getLastFeaturedSlug(): string | null {
  return lastFeaturedSlug;
}

export function resetFeaturedVisitMemory(): void {
  lastFeaturedSlug = null;
}
