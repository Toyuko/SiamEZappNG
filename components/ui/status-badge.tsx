import type { CaseStatus } from '../../features/cases/cases.types';
import { Badge } from './Badge';

const statusVariantMap: Record<CaseStatus, 'info' | 'pending' | 'error' | 'success'> = {
  NEW: 'info',
  IN_PROGRESS: 'pending',
  WAITING_CLIENT: 'error',
  COMPLETED: 'success',
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return <Badge label={status.replaceAll('_', ' ')} variant={statusVariantMap[status]} />;
}
