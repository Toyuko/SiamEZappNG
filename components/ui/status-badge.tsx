import { Text, View } from 'react-native';

import type { CaseStatus } from '../../features/cases/cases.types';

const statusClassMap: Record<CaseStatus, { container: string; text: string }> = {
  NEW: { container: 'bg-blue-100', text: 'text-blue-700' },
  IN_PROGRESS: { container: 'bg-amber-100', text: 'text-amber-700' },
  WAITING_CLIENT: { container: 'bg-violet-100', text: 'text-violet-700' },
  COMPLETED: { container: 'bg-emerald-100', text: 'text-emerald-700' },
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  const classes = statusClassMap[status];
  return (
    <View className={`self-start rounded-full px-3 py-1 ${classes.container}`}>
      <Text className={`text-xs font-semibold ${classes.text}`}>{status.replaceAll('_', ' ')}</Text>
    </View>
  );
}
