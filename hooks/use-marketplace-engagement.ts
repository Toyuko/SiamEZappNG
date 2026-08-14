import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchMarketplaceEngagement,
  removeMarketplaceCompare,
  saveMarketplaceListing,
  unsaveMarketplaceListing,
  addMarketplaceCompare,
  recordMarketplaceView,
} from '../features/marketplace/marketplace.api';
import type { MarketplaceListingType } from '../features/marketplace/marketplace.types';
import { useSessionQueryEnabled } from './use-session-query-enabled';

export const marketplaceEngagementKey = ['marketplace', 'engagement'] as const;

export function useMarketplaceEngagement(enabled = true) {
  const sessionEnabled = useSessionQueryEnabled();
  return useQuery({
    queryKey: marketplaceEngagementKey,
    queryFn: fetchMarketplaceEngagement,
    enabled: enabled && sessionEnabled,
  });
}

export function useSaveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingType,
      listingId,
      saved,
    }: {
      listingType: MarketplaceListingType;
      listingId: string;
      saved: boolean;
    }) =>
      saved
        ? saveMarketplaceListing(listingType, listingId)
        : unsaveMarketplaceListing(listingType, listingId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: marketplaceEngagementKey });
    },
  });
}

export function useCompareListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingType,
      listingId,
      inCompare,
    }: {
      listingType: MarketplaceListingType;
      listingId: string;
      inCompare: boolean;
    }) =>
      inCompare
        ? addMarketplaceCompare(listingType, listingId)
        : removeMarketplaceCompare(listingType, listingId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: marketplaceEngagementKey });
    },
  });
}

export function useRecordListingView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      listingType,
      listingId,
    }: {
      listingType: MarketplaceListingType;
      listingId: string;
    }) => recordMarketplaceView(listingType, listingId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: marketplaceEngagementKey });
    },
  });
}
