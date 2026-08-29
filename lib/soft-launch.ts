/**
 * Soft-launch surface control — mirrors website `src/config/soft-launch.ts`.
 *
 * Prefer hiding unfinished product areas over deleting infrastructure.
 * Runtime: `/api/v1/feature-flags` → `soft_launch` (default true).
 * Offline/startup fallback: `EXPO_PUBLIC_SOFT_LAUNCH` (default enabled unless "false").
 */
export const softLaunchDefaults = {
  /** When true, primary IA focuses on Services / Vehicles / RE / Concierge. */
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
} as const;

/** Tab/route names deferred during soft launch (still exist for deep links / legacy roles). */
export const SOFT_LAUNCH_HIDDEN_TABS = [
  'home',
  'book',
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
  'freelancers',
]);

export function isSoftLaunchEnvEnabled(): boolean {
  return softLaunchDefaults.enabled;
}
