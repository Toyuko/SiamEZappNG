import type { ServiceCategoryId } from '../../features/services/services.types';
import { siam } from '../../lib/theme/tokens';

type IconGradient = {
  colors: readonly [string, string, ...string[]];
  /** Glyph color that reads well on the gradient. */
  foreground: string;
  /** Shadow tint for the icon tile. */
  shadow: string;
};

const WHITE = '#ffffff';
const ON_GOLD = '#1f2937';

/**
 * Modern per-category icon gradients — vivid blue / gold "app icon" style
 * squircles that stay on the SiamEZ brand palette.
 */
export const SERVICE_ICON_GRADIENT: Record<ServiceCategoryId, IconGradient> = {
  'driving-vehicle': { colors: [siam.blue.bright, siam.blue.DEFAULT], foreground: WHITE, shadow: siam.blue.DEFAULT },
  'immigration-legal': { colors: [siam.blue.light, siam.blue.dark], foreground: WHITE, shadow: siam.blue.dark },
  'translation-documents': { colors: [siam.blue.bright, siam.blue.dark], foreground: WHITE, shadow: siam.blue.DEFAULT },
  'home-property': { colors: [siam.yellow.light, siam.yellow.dark], foreground: ON_GOLD, shadow: siam.yellow.dark },
  'transport-private-driver': { colors: [siam.blue.DEFAULT, siam.blue.dark], foreground: WHITE, shadow: siam.blue.dark },
  'events-lifestyle': { colors: [siam.yellow.light, siam.yellow.DEFAULT], foreground: ON_GOLD, shadow: siam.yellow.dark },
  'business-services': { colors: [siam.blue.light, siam.blue.DEFAULT], foreground: WHITE, shadow: siam.blue.DEFAULT },
};

export const SERVICE_ICON_GRADIENT_START = { x: 0, y: 0 } as const;
export const SERVICE_ICON_GRADIENT_END = { x: 1, y: 1 } as const;
