import type { ImageSourcePropType } from 'react-native';

import type { ServiceCategoryId } from './services.types';

/** Local bundled category hero images — static requires for Metro. */
export const CATEGORY_IMAGES: Record<ServiceCategoryId, ImageSourcePropType> = {
  'driving-vehicle': require('../../assets/categories/driving-vehicle.jpg'),
  'immigration-legal': require('../../assets/categories/immigration-legal.jpg'),
  'translation-documents': require('../../assets/categories/translation-documents.jpg'),
  'home-property': require('../../assets/categories/home-property.jpg'),
  'transport-private-driver': require('../../assets/categories/transport-private-driver.jpg'),
  'events-lifestyle': require('../../assets/categories/events-lifestyle.jpg'),
  'business-services': require('../../assets/categories/business-services.jpg'),
};
