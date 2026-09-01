import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export type FeatureFlags = Record<string, boolean>;

export async function fetchFeatureFlags() {
  const response = await api.get<FeatureFlags | ApiEnvelope<FeatureFlags>>(
    '/api/v1/feature-flags'
  );
  return unwrapApiData(response);
}
