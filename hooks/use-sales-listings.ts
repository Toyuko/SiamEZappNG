import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createVehicleListing,
  deleteVehicleListing,
  fetchMyVehicleListings,
  fetchVehiclesPage,
  fetchVehicleListingById,
  updateVehicleListing,
  type SalesListFilters,
  type VehicleListingWriteInput,
} from '../features/sales/sales.api';
import { useSessionQueryEnabled } from './use-session-query-enabled';

export function salesListQueryKey(filters: SalesListFilters) {
  return ['sales-listings', filters] as const;
}

export function useSalesListings(filters: SalesListFilters, enabled = true) {
  return useQuery({
    queryKey: salesListQueryKey(filters),
    queryFn: () => fetchVehiclesPage(filters),
    enabled,
  });
}

export function useMyVehicleListings(enabled = true) {
  const sessionEnabled = useSessionQueryEnabled();
  return useQuery({
    queryKey: ['my-vehicle-listings'],
    queryFn: fetchMyVehicleListings,
    enabled: enabled && sessionEnabled,
  });
}

export function useVehicleListing(id: string | undefined) {
  return useQuery({
    queryKey: ['vehicle-listing', id],
    queryFn: () => fetchVehicleListingById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateVehicleListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleListingWriteInput) => createVehicleListing(input),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['sales-listings'] }),
        qc.invalidateQueries({ queryKey: ['my-vehicle-listings'] }),
        qc.invalidateQueries({ queryKey: ['seller-analytics'] }),
      ]);
    },
  });
}

export function useUpdateVehicleListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VehicleListingWriteInput }) =>
      updateVehicleListing(id, input),
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['sales-listings'] }),
        qc.invalidateQueries({ queryKey: ['my-vehicle-listings'] }),
        qc.invalidateQueries({ queryKey: ['vehicle-listing', vars.id] }),
        qc.invalidateQueries({ queryKey: ['seller-analytics'] }),
      ]);
    },
  });
}

export function useDeleteVehicleListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicleListing(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['sales-listings'] }),
        qc.invalidateQueries({ queryKey: ['my-vehicle-listings'] }),
        qc.invalidateQueries({ queryKey: ['seller-analytics'] }),
      ]);
    },
  });
}
