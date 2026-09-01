/** Matches web `SLUG_REGEX` / `normalizeSlug` in SiamEZwebNG. */
export const FREELANCER_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_FREELANCER_SLUGS = new Set([
  'me',
  'new',
  'edit',
  'admin',
  'api',
  'search',
  'browse',
]);

export function normalizeFreelancerSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function isValidFreelancerSlug(slug: string): boolean {
  return FREELANCER_SLUG_REGEX.test(slug) && slug.length >= 3 && slug.length <= 48;
}

export function getFreelancerSlugError(slug: string): string | null {
  if (!slug) {
    return 'Slug is required';
  }
  if (slug.length < 3) {
    return 'Slug must be at least 3 characters';
  }
  if (slug.length > 48) {
    return 'Slug must be at most 48 characters';
  }
  if (!FREELANCER_SLUG_REGEX.test(slug)) {
    return 'Use lowercase letters, numbers, and hyphens only';
  }
  if (RESERVED_FREELANCER_SLUGS.has(slug)) {
    return 'This username is reserved. Please choose another.';
  }
  return null;
}
