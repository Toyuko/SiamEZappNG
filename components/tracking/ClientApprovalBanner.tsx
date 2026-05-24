import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Clock, ShieldCheck } from 'lucide-react-native';

import { Button } from '../ui/Button';
import { getAutoApprovalRemainingMs } from '../../lib/jobs/auto-approve';
import { JOB_AUTO_APPROVE_MS } from '../../lib/jobs/constants';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { t } from '../../lib/i18n/i18n';

type ClientApprovalBannerProps = {
  completionSubmittedAt: string;
  onConfirm: () => void;
  confirming?: boolean;
  error?: string | null;
};

export function ClientApprovalBanner({
  completionSubmittedAt,
  onConfirm,
  confirming = false,
  error = null,
}: ClientApprovalBannerProps) {
  const { colors } = useTheme();
  const [remainingMs, setRemainingMs] = useState(() => getAutoApprovalRemainingMs(completionSubmittedAt));

  useEffect(() => {
    const tick = () => setRemainingMs(getAutoApprovalRemainingMs(completionSubmittedAt));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [completionSubmittedAt]);

  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  const progressPercent = Math.min(100, Math.round(((JOB_AUTO_APPROVE_MS - remainingMs) / JOB_AUTO_APPROVE_MS) * 100));

  return (
    <View
      style={{
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: `${siam.blue.DEFAULT}40`,
        backgroundColor: `${siam.blue.DEFAULT}10`,
        padding: spacing.cardPadding,
        gap: spacing.stackMd,
      }}
    >
      <View className="flex-row items-start" style={{ gap: spacing.stackMd }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.full,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={22} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text className="text-base font-semibold" style={{ color: colors.primary }}>
            {t('tracking.approvalBannerTitle')}
          </Text>
          <Text className="mt-2 text-sm leading-5" style={{ color: colors.foreground }}>
            {remainingMs > 0
              ? t('tracking.approvalBannerBody', { minutes: remainingMinutes })
              : t('tracking.approvalBannerImminent')}
          </Text>
          {remainingMs > 0 ? (
            <View className="mt-2 flex-row items-center gap-1.5">
              <Clock size={14} color={colors.muted} />
              <Text className="text-xs" style={{ color: colors.muted }}>
                {t('tracking.autoApprovalCountdown', { minutes: remainingMinutes })}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Button
        label={confirming ? t('tracking.confirming') : t('tracking.confirmReleaseFunds')}
        disabled={confirming}
        onPress={onConfirm}
      />

      {error ? (
        <Text className="text-sm" style={{ color: '#d97706' }}>
          {error}
        </Text>
      ) : null}

      <View
        style={{
          height: 6,
          borderRadius: radius.full,
          backgroundColor: `${siam.blue.DEFAULT}20`,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: colors.primary,
            borderRadius: radius.full,
          }}
        />
      </View>
    </View>
  );
}
