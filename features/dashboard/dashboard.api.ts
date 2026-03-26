import { api } from '../../lib/api';

export type DashboardOverview = {
  activeCases: number;
  pendingInvoices: number;
  recentUpdates: number;
};

export async function getDashboardOverview() {
  return api.get<DashboardOverview>('/api/dashboard/overview');
}
