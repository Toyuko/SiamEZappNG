import type { AppLanguage } from '../../lib/i18n/i18n';
import { t } from '../../lib/i18n/i18n';
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_ORDER } from './services.types';
import type { ServiceBadgeId, ServiceCategoryId, ServiceItem } from './services.types';

export function getCategoryLabel(categoryId: ServiceCategoryId): string {
  const config = SERVICE_CATEGORIES.find((item) => item.id === categoryId);
  return config ? t(config.labelKey) : categoryId;
}

export function getServiceTitle(service: ServiceItem, language: AppLanguage): string {
  return language === 'th' ? service.titleTh : service.titleEn;
}

export function getServiceDescription(service: ServiceItem, language: AppLanguage): string {
  return language === 'th' ? service.descriptionTh : service.descriptionEn;
}

export function getServicePriceFrom(service: ServiceItem): string | null {
  const amount = service.priceFrom ?? service.cardPriceBaht;
  if (amount == null || amount.length === 0) {
    return null;
  }
  return t('services.priceFromBaht', { amount });
}

export function getBadgeLabel(badge: ServiceBadgeId): string {
  const keyMap: Record<ServiceBadgeId, string> = {
    popular: 'services.badges.popular',
    sameDay: 'services.badges.sameDay',
    fixedPrice: 'services.badges.fixedPrice',
    homeService: 'services.badges.homeService',
    nationwide: 'services.badges.nationwide',
  };
  return t(keyMap[badge]);
}

export function getCategoryPageIndex(categoryId: ServiceCategoryId): number {
  return SERVICE_CATEGORY_ORDER.indexOf(categoryId);
}

export function filterServicesByQuery(services: ServiceItem[], query: string, language: AppLanguage): ServiceItem[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) {
    return services;
  }
  return services.filter((item) => {
    const haystack = [
      item.slug,
      item.titleEn,
      item.titleTh,
      item.descriptionEn,
      item.descriptionTh,
      item.category,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(trimmed);
  });
}
