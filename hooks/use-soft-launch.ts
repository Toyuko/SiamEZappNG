import { useQuery } from '@tanstack/react-query';

import { fetchFeatureFlags } from '../features/feature-flags/feature-flags.api';
import {
  isSoftLaunchEnvEnabled,
  softLaunchDefaults,
} from '../lib/soft-launch';

export type SoftLaunchState = {
  enabled: boolean;
  showSellerListings: boolean;
  showFreelancers: boolean;
  showLifeEvents: boolean;
  showWorkflows: boolean;
  showCompanies: boolean;
  isLoading: boolean;
};

/**
 * Soft-launch IA state for mobile.
 * Prefers Platform `soft_launch` feature flag; falls back to EXPO_PUBLIC_SOFT_LAUNCH.
 */
export function useSoftLaunch(): SoftLaunchState {
  const flagsQuery = useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlags,
    staleTime: 60_000,
    retry: 1,
  });

  const envEnabled = isSoftLaunchEnvEnabled();
  const flagValue = flagsQuery.data?.soft_launch;
  const enabled =
    typeof flagValue === 'boolean' ? flagValue : envEnabled;

  return {
    enabled,
    showSellerListings: softLaunchDefaults.showSellerListings,
    showFreelancers: enabled ? softLaunchDefaults.showFreelancers : true,
    showLifeEvents: enabled ? softLaunchDefaults.showLifeEvents : true,
    showWorkflows: enabled ? softLaunchDefaults.showWorkflows : true,
    showCompanies: enabled ? softLaunchDefaults.showCompanies : true,
    isLoading: flagsQuery.isLoading,
  };
}
