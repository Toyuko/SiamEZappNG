import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export type DashboardOverview = {
  activeCases: number;
  pendingInvoices: number;
  recentUpdates: number;
};

export async function getDashboardOverview() {
  const response = await api.get<DashboardOverview | ApiEnvelope<DashboardOverview>>('/api/dashboard/overview');
  return unwrapApiData<DashboardOverview>(response);
}
