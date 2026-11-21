/**
 * Soft-launch surface control — mirrors website `src/config/soft-launch.ts`.
 *
 * Prefer hiding unfinished product areas over deleting infrastructure.
 * Runtime: `/api/v1/feature-flags` → `soft_launch` (default true).
 * Offline/startup fallback: `EXPO_PUBLIC_SOFT_LAUNCH` (default enabled unless "false").
 *
 * Conversion IA (soft launch): Home / Services / Book are primary tabs.
 * Vehicles, property, and freelancers stay reachable via More + Home shortcuts.
 */
export const softLaunchDefaults = {
  /** When true, primary IA focuses on booking conversion. */
  enabled: process.env.EXPO_PUBLIC_SOFT_LAUNCH !== 'false',

  /** Seller listing management stays on (vehicles + RE are launch surfaces). */
  showSellerListings: true,

  /** Public freelancer directory + signup as freelancer (mirrors web soft-launch). */
  showFreelancers: true,

  /** Life-event journeys & goals. */
  showLifeEvents: false,

  /** Workflow runs. */
  showWorkflows: false,

  /** Company / B2B signup & discovery. */
  showCompanies: false,

  /** Smart Match AI matching demo — hidden from public release. */
  showSmartMatch: false,
} as const;

/**
 * Tabs deferred from the bottom bar during soft launch (still exist for deep links).
 * Home + Book stay visible — they are the conversion funnel.
 * Marketplace tabs move under More to keep the bar focused on booking.
 */
export const SOFT_LAUNCH_HIDDEN_TABS = [
  'sales',
  'real-estate',
  'goals',
  'life-events',
  'workflows',
  'saved',
] as const;

export const SOFT_LAUNCH_DEFERRED_ROUTES = new Set([
  'goals',
  'life-events',
  'workflows',
  'saved',
  'smart-match',
]);

export function isSoftLaunchEnvEnabled(): boolean {
  return softLaunchDefaults.enabled;
}
