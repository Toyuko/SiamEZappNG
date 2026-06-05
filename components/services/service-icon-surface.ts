import type { ServiceCategoryId } from '../../features/services/services.types';

/** Category-tinted icon backgrounds — aligned with SiamEZ blue / yellow palette */
export const SERVICE_ICON_SURFACE: Record<ServiceCategoryId, { light: string; dark: string }> = {
  'driving-vehicle': { light: 'rgba(44, 84, 198, 0.14)', dark: 'rgba(91, 118, 224, 0.26)' },
  'immigration-legal': { light: 'rgba(44, 84, 198, 0.12)', dark: 'rgba(91, 118, 224, 0.22)' },
  'translation-documents': { light: 'rgba(91, 118, 224, 0.12)', dark: 'rgba(91, 118, 224, 0.22)' },
  'home-property': { light: 'rgba(255, 206, 45, 0.22)', dark: 'rgba(255, 206, 45, 0.16)' },
  'transport-private-driver': { light: 'rgba(44, 84, 198, 0.1)', dark: 'rgba(91, 118, 224, 0.2)' },
  'events-lifestyle': { light: 'rgba(255, 206, 45, 0.18)', dark: 'rgba(255, 206, 45, 0.14)' },
  'business-services': { light: 'rgba(44, 84, 198, 0.12)', dark: 'rgba(91, 118, 224, 0.22)' },
};
