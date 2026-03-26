import { apiClient } from '../../lib/api/client';

export type DashboardOverview = {
  activeCases: number;
  pendingInvoices: number;
  recentUpdates: number;
};

export async function getDashboardOverview() {
  const { data } = await apiClient.get<DashboardOverview>('/client/dashboard/overview');
  return data;
}
