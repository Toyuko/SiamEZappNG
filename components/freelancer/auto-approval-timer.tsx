import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import type { JobStatus } from '../../features/freelancer/freelancer.types';
import { t } from '../../lib/i18n/i18n';
import { getAutoApprovalRemainingMs } from '../../lib/jobs/auto-approve';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type AutoApprovalTimerProps = {
  status: JobStatus;
  completionSubmittedAt?: string | null;
};

function formatCountdown(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function AutoApprovalTimer({ status, completionSubmittedAt }: AutoApprovalTimerProps) {
  const { colors } = useTheme();
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!completionSubmittedAt || status !== 'completed') {
      return;
    }

    const tick = () => setRemainingMs(getAutoApprovalRemainingMs(completionSubmittedAt));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [completionSubmittedAt, status]);

  if (status === 'approved') {
    return (
      <View
        style={{
          backgroundColor: `${siam.blue.DEFAULT}14`,
          borderRadius: 12,
          padding: spacing.cardPaddingCompact,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text className="text-sm font-semibold" style={{ color: colors.success }}>
          {t('freelancer.jobApproved')}
        </Text>
      </View>
    );
  }

  if (status !== 'completed' || !completionSubmittedAt) {
    return null;
  }

  const expired = remainingMs <= 0;

  return (
    <View
      style={{
        backgroundColor: expired ? '#fef3c7' : `${siam.yellow.DEFAULT}33`,
        borderRadius: 12,
        padding: spacing.cardPaddingCompact,
        borderWidth: 1,
        borderColor: siam.yellow.dark,
        gap: spacing.stackSm,
      }}
    >
      <Text className="text-sm font-semibold" style={{ color: siam.blue.dark }}>
        {t('freelancer.autoApprovalCountdown')}
      </Text>
      <Text className="font-mono text-2xl font-bold" style={{ color: siam.blue.DEFAULT }}>
        {expired ? t('freelancer.autoApprovalImminent') : formatCountdown(remainingMs)}
      </Text>
      <Text className="text-xs leading-5" style={{ color: colors.muted }}>
        {t('freelancer.autoApprovalHint')}
      </Text>
    </View>
  );
}
