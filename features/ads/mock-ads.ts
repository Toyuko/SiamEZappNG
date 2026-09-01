import { Image, type ImageSourcePropType } from 'react-native';

import type { ServiceCategoryId } from '../services/services.types';
import { KRISTIE_LTD_AD_IMAGE } from './ad-images';

export type MockAdId =
  | 'kristieLtd'
  | 'healthCheckup'
  | 'airportTransfer'
  | 'expatInsurance'
  | 'drivingLicense'
  | 'visaExtension'
  | 'certifiedTranslation'
  | 'homeDeepClean'
  | 'weddingPlanner'
  | 'companyRegistration';

export type MockAdConfig = {
  id: MockAdId;
  variant: 'gradient' | 'image';
  icon?: 'medkit' | 'airplane' | 'shield-checkmark' | 'car' | 'document-text' | 'language' | 'home' | 'sparkles' | 'briefcase';
  gradient?: readonly [string, string];
  image?: ImageSourcePropType;
  /** Width / height — used to size image ads so the creative fits edge-to-edge. */
  imageAspectRatio?: number;
  advertiserKey: string;
  titleKey: string;
  subtitleKey: string;
  offerKey: string;
  ctaKey: string;
};

export const MOCK_ADS: MockAdConfig[] = [
  {
    id: 'kristieLtd',
    variant: 'image',
    image: KRISTIE_LTD_AD_IMAGE,
    imageAspectRatio: 1024 / 426,
    advertiserKey: 'ads.mock.kristieLtd.advertiser',
    titleKey: 'ads.mock.kristieLtd.title',
    subtitleKey: 'ads.mock.kristieLtd.subtitle',
    offerKey: 'ads.mock.kristieLtd.offer',
    ctaKey: 'ads.mock.kristieLtd.cta',
  },
  {
    id: 'healthCheckup',
    variant: 'gradient',
    icon: 'medkit',
    gradient: ['#0ea5e9', '#0369a1'],
    advertiserKey: 'ads.mock.healthCheckup.advertiser',
    titleKey: 'ads.mock.healthCheckup.title',
    subtitleKey: 'ads.mock.healthCheckup.subtitle',
    offerKey: 'ads.mock.healthCheckup.offer',
    ctaKey: 'ads.mock.healthCheckup.cta',
  },
  {
    id: 'airportTransfer',
    variant: 'gradient',
    icon: 'airplane',
    gradient: ['#8b5cf6', '#5b21b6'],
    advertiserKey: 'ads.mock.airportTransfer.advertiser',
    titleKey: 'ads.mock.airportTransfer.title',
    subtitleKey: 'ads.mock.airportTransfer.subtitle',
    offerKey: 'ads.mock.airportTransfer.offer',
    ctaKey: 'ads.mock.airportTransfer.cta',
  },
  {
    id: 'expatInsurance',
    variant: 'gradient',
    icon: 'shield-checkmark',
    gradient: ['#10b981', '#047857'],
    advertiserKey: 'ads.mock.expatInsurance.advertiser',
    titleKey: 'ads.mock.expatInsurance.title',
    subtitleKey: 'ads.mock.expatInsurance.subtitle',
    offerKey: 'ads.mock.expatInsurance.offer',
    ctaKey: 'ads.mock.expatInsurance.cta',
  },
  {
    id: 'drivingLicense',
    variant: 'gradient',
    icon: 'car',
    gradient: ['#f59e0b', '#b45309'],
    advertiserKey: 'ads.mock.drivingLicense.advertiser',
    titleKey: 'ads.mock.drivingLicense.title',
    subtitleKey: 'ads.mock.drivingLicense.subtitle',
    offerKey: 'ads.mock.drivingLicense.offer',
    ctaKey: 'ads.mock.drivingLicense.cta',
  },
  {
    id: 'visaExtension',
    variant: 'gradient',
    icon: 'document-text',
    gradient: ['#6366f1', '#4338ca'],
    advertiserKey: 'ads.mock.visaExtension.advertiser',
    titleKey: 'ads.mock.visaExtension.title',
    subtitleKey: 'ads.mock.visaExtension.subtitle',
    offerKey: 'ads.mock.visaExtension.offer',
    ctaKey: 'ads.mock.visaExtension.cta',
  },
  {
    id: 'certifiedTranslation',
    variant: 'gradient',
    icon: 'language',
    gradient: ['#14b8a6', '#0f766e'],
    advertiserKey: 'ads.mock.certifiedTranslation.advertiser',
    titleKey: 'ads.mock.certifiedTranslation.title',
    subtitleKey: 'ads.mock.certifiedTranslation.subtitle',
    offerKey: 'ads.mock.certifiedTranslation.offer',
    ctaKey: 'ads.mock.certifiedTranslation.cta',
  },
  {
    id: 'homeDeepClean',
    variant: 'gradient',
    icon: 'home',
    gradient: ['#ec4899', '#be185d'],
    advertiserKey: 'ads.mock.homeDeepClean.advertiser',
    titleKey: 'ads.mock.homeDeepClean.title',
    subtitleKey: 'ads.mock.homeDeepClean.subtitle',
    offerKey: 'ads.mock.homeDeepClean.offer',
    ctaKey: 'ads.mock.homeDeepClean.cta',
  },
  {
    id: 'weddingPlanner',
    variant: 'gradient',
    icon: 'sparkles',
    gradient: ['#a855f7', '#7e22ce'],
    advertiserKey: 'ads.mock.weddingPlanner.advertiser',
    titleKey: 'ads.mock.weddingPlanner.title',
    subtitleKey: 'ads.mock.weddingPlanner.subtitle',
    offerKey: 'ads.mock.weddingPlanner.offer',
    ctaKey: 'ads.mock.weddingPlanner.cta',
  },
  {
    id: 'companyRegistration',
    variant: 'gradient',
    icon: 'briefcase',
    gradient: ['#64748b', '#334155'],
    advertiserKey: 'ads.mock.companyRegistration.advertiser',
    titleKey: 'ads.mock.companyRegistration.title',
    subtitleKey: 'ads.mock.companyRegistration.subtitle',
    offerKey: 'ads.mock.companyRegistration.offer',
    ctaKey: 'ads.mock.companyRegistration.cta',
  },
];

const MOCK_AD_BY_ID = Object.fromEntries(MOCK_ADS.map((ad) => [ad.id, ad])) as Record<MockAdId, MockAdConfig>;

/** Category-specific ad shown when the user is browsing that service area. */
const CATEGORY_AD_MAP: Record<ServiceCategoryId, MockAdId> = {
  'driving-vehicle': 'drivingLicense',
  'immigration-legal': 'visaExtension',
  'translation-documents': 'certifiedTranslation',
  'home-property': 'homeDeepClean',
  'transport-private-driver': 'airportTransfer',
  'events-lifestyle': 'kristieLtd',
  'business-services': 'companyRegistration',
};

export function getMockAdById(id: MockAdId): MockAdConfig {
  return MOCK_AD_BY_ID[id];
}

export function getImageAdHeight(ad: MockAdConfig, width: number): number {
  if (ad.variant !== 'image' || !ad.image) {
    return 0;
  }

  let aspectRatio = ad.imageAspectRatio;
  const resolve = Image.resolveAssetSource;
  if (typeof resolve === 'function') {
    const source = resolve(ad.image);
    if (source?.width && source?.height) {
      aspectRatio = source.width / source.height;
    }
  }

  if (!aspectRatio) {
    return 0;
  }

  return Math.round(width / aspectRatio);
}

export const DEFAULT_MOCK_AD: MockAdConfig = MOCK_AD_BY_ID.kristieLtd;

export function getDefaultMockAd(): MockAdConfig {
  return DEFAULT_MOCK_AD;
}

export function getMockAdForCategory(categoryId: ServiceCategoryId): MockAdConfig {
  return getMockAdById(CATEGORY_AD_MAP[categoryId]);
}

export function pickRandomMockAd(): MockAdConfig {
  return MOCK_ADS[Math.floor(Math.random() * MOCK_ADS.length)]!;
}
