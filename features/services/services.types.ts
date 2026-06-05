import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

/** Vector icon name — avoids emoji font gaps on iOS */
export type ServiceCatalogIconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Web-aligned service directory categories.
 * Each category maps to one swipeable page in the Services screen.
 */
export type ServiceCategoryId =
  | 'driving-vehicle'
  | 'immigration-legal'
  | 'translation-documents'
  | 'home-property'
  | 'transport-private-driver'
  | 'events-lifestyle'
  | 'business-services';

export type ServiceBadgeId = 'popular' | 'sameDay' | 'fixedPrice' | 'homeService' | 'nationwide';

/** Ordered list — index matches swipe page order */
export const SERVICE_CATEGORY_ORDER: ServiceCategoryId[] = [
  'driving-vehicle',
  'immigration-legal',
  'translation-documents',
  'home-property',
  'transport-private-driver',
  'events-lifestyle',
  'business-services',
];

export type ServiceCategoryConfig = {
  id: ServiceCategoryId;
  /** Ionicons name shown on category tab */
  icon: ServiceCatalogIconName;
  /** i18n key under services.categories.* */
  labelKey: string;
};

export const SERVICE_CATEGORIES: ServiceCategoryConfig[] = [
  { id: 'driving-vehicle', icon: 'car-outline', labelKey: 'services.categories.drivingVehicle' },
  { id: 'immigration-legal', icon: 'document-outline', labelKey: 'services.categories.immigrationLegal' },
  { id: 'translation-documents', icon: 'language-outline', labelKey: 'services.categories.translationDocuments' },
  { id: 'home-property', icon: 'home-outline', labelKey: 'services.categories.homeProperty' },
  { id: 'transport-private-driver', icon: 'bus-outline', labelKey: 'services.categories.transportPrivateDriver' },
  { id: 'events-lifestyle', icon: 'sparkles-outline', labelKey: 'services.categories.eventsLifestyle' },
  { id: 'business-services', icon: 'briefcase-outline', labelKey: 'services.categories.businessServices' },
];

export type ServiceItem = {
  id: string;
  slug: string;
  category: ServiceCategoryId;
  titleEn: string;
  titleTh: string;
  descriptionEn: string;
  descriptionTh: string;
  /** English title — mirrors titleEn for legacy consumers */
  title: string;
  /** English short copy — mirrors descriptionEn for legacy consumers */
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  steps: string[];
  requirements?: string[];
  requiredDocuments?: string[];
  overviewHighlights?: { title: string; description: string }[];
  pricingPackages?: {
    name: string;
    price: string;
    isPopular?: boolean;
    ctaLabel: string;
    features: string[];
  }[];
  faqs?: { question: string; answer: string }[];
  processingTime?: string;
  rating?: string;
  consultationNote?: string;
  disclaimer?: string;
  icon: ServiceCatalogIconName;
  /** Starting price in baht (digits only) — shown as “From ฿{amount}” */
  priceFrom?: string;
  estimatedTime?: string;
  badges: ServiceBadgeId[];
  featured: boolean;
  active: boolean;
  /** @deprecated Prefer priceFrom */
  cardPriceBaht?: string;
  /** @deprecated Prefer badges */
  cardBadge?: 'popular' | 'fast';
};
