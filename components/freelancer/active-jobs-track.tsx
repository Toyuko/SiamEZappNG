import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, MapPin } from 'lucide-react-native';

import type { FreelancerJob } from '../../features/freelancer/freelancer.types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/empty-state';
import { t } from '../../lib/i18n/i18n';
import { jobProgressPercent } from '../../lib/jobs/auto-approve';
import { formatJobAmount } from '../../lib/jobs/format-amount';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type ActiveJobsTrackProps = {
  jobs: FreelancerJob[];
  completingJobId?: string | null;
  onMarkDone?: (jobId: string) => void;
};

export function ActiveJobsTrack({ jobs, completingJobId, onMarkDone }: ActiveJobsTrackProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Card>
      <View className="flex-row items-center gap-2 border-b pb-3" style={{ borderColor: colors.border }}>
        <MapPin size={20} color={colors.primary} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text className="text-base font-semibold" style={{ color: colors.primary }}>
            {t('freelancer.activeTrackTrace')}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {t('freelancer.activeTrackTraceSubtitle')}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.stackMd, gap: spacing.stackMd }}>
        {jobs.length === 0 ? (
          <EmptyState label={t('freelancer.noActiveJobs')} />
        ) : (
          jobs.map((job) => {
            const progress = jobProgressPercent(job.status);
            const canMarkDone = job.status === 'in_progress';
            const progressColor =
              job.status === 'completed' || job.status === 'approved'
                ? job.status === 'approved'
                  ? '#10b981'
                  : siam.yellow.DEFAULT
                : colors.primary;

            return (
              <View
                key={job.id}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.cardPaddingCompact,
                }}
              >
                <Pressable
                  onPress={() => router.push(`/freelancer/tracking/${job.id}`)}
                  style={{ minHeight: 48, justifyContent: 'center' }}
                  accessibilityRole="button"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View style={{ flex: 1 }}>
                      <Text className="font-semibold" style={{ color: colors.foreground }}>
                        {job.title}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.muted }}>
                        {job.postedBy.name ?? '—'}
                      </Text>
                    </View>
                    <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                      {formatJobAmount(job.amount, job.currency)}
                    </Text>
                  </View>
                </Pressable>

                <View className="mt-3" style={{ gap: spacing.stackSm }}>
                  <View className="flex-row justify-between">
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {t(`freelancer.status.${job.status}`)}
                    </Text>
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      {progress}%
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 8,
                      borderRadius: 9999,
                      backgroundColor: colors.border,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: progressColor,
                        borderRadius: 9999,
                      }}
                    />
                  </View>
                </View>

        {canMarkDone && onMarkDone ? (
                  completingJobId === job.id ? (
                    <View className="mt-3" style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator color={colors.primary} />
                    </View>
                  ) : (
                    <View className="mt-3">
                      <Button
                        label={t('freelancer.markAsDone')}
                        size="md"
                        onPress={() => onMarkDone(job.id)}
                      />
                    </View>
                  )
                ) : null}

                {job.status === 'completed' ? (
                  <Text className="mt-2 text-xs" style={{ color: '#d97706' }}>
                    {t('freelancer.awaitingClientApproval')}
                  </Text>
                ) : null}

                {job.status === 'approved' ? (
                  <View className="mt-2 flex-row items-center gap-1">
                    <CheckCircle2 size={14} color={colors.success} strokeWidth={2} />
                    <Text className="text-xs" style={{ color: colors.success }}>
                      {t('freelancer.jobApproved')}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </View>
    </Card>
  );
}
