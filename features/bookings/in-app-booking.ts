/**
 * Booking uses the same system as the website: the app POSTs to `/api/bookings`
 * with the canonical service slug (or id). A few app catalog slugs differ from the
 * website's canonical service slugs, so map them before submitting.
 */
const SERVICE_SLUG_ALIASES: Record<string, string> = {
  'car-motorbike-finding-selling': 'car-motorbike-finder-selling-service',
  'basic-translation-fixed-price': 'basic-translation',
};

/** Map an app catalog slug to the canonical backend service slug used by `/api/bookings`. */
export function toBackendServiceSlug(slug: string): string {
  return SERVICE_SLUG_ALIASES[slug] ?? slug;
}
