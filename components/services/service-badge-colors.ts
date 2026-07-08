import type { ServiceBadgeId } from '../../features/services/services.types';

/** Web-aligned badge pill colors (popular = gold, same day = green, etc.) */
export const SERVICE_BADGE_COLORS: Record<ServiceBadgeId, { background: string; text: string }> = {
  popular: { background: 'rgba(255, 206, 45, 0.28)', text: '#92400e' },
  sameDay: { background: 'rgba(34, 197, 94, 0.18)', text: '#15803d' },
  fixedPrice: { background: 'rgba(44, 84, 198, 0.12)', text: '#1d4ed8' },
  homeService: { background: 'rgba(168, 85, 247, 0.15)', text: '#7e22ce' },
  nationwide: { background: 'rgba(99, 102, 241, 0.15)', text: '#4338ca' },
};
