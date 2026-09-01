import { appConfig } from '../../lib/config';

/**
 * App slug → web poster filename stem (without `-poster.png`).
 * Default: use the app slug as-is (`{slug}-poster.png` on the web CDN).
 */
const SERVICE_POSTER_SLUG_OVERRIDES: Record<string, string> = {
  'car-motorbike-finding-selling': 'car-motorbike-finder-selling',
  'basic-translation-fixed-price': 'translation-services',
};

export function getServicePosterImageUrl(slug: string): string {
  const posterSlug = SERVICE_POSTER_SLUG_OVERRIDES[slug] ?? slug;
  return `${appConfig.webBaseUrl}/images/services/${posterSlug}-poster.png`;
}
