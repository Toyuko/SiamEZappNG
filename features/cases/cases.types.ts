export type CaseStatus = 'NEW' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'COMPLETED';

export type ClientCase = {
  id: string;
  title: string;
  serviceType: string;
  status: CaseStatus;
  updatedAt: string;
};
