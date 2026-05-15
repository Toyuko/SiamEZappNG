import { ActivityIndicator, Text, View } from 'react-native';
import { Building2, Briefcase } from 'lucide-react-native';

import type { FreelancerJob } from '../../features/freelancer/freelancer.types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/empty-state';
import { t } from '../../lib/i18n/i18n';
import { formatJobAmount } from '../../lib/jobs/format-amount';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type JobFeedSectionProps = {
  jobs: FreelancerJob[];
  acceptingJobId?: string | null;
  onAcceptJob?: (jobId: string) => void;
};

export function JobFeedSection({ jobs, acceptingJobId, onAcceptJob }: JobFeedSectionProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <View className="flex-row items-center gap-2 border-b pb-3" style={{ borderColor: colors.border }}>
        <Briefcase size={20} color={colors.primary} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Text className="text-base font-semibold" style={{ color: colors.primary }}>
            {t('freelancer.jobFeed')}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {t('freelancer.jobFeedSubtitle')}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.stackMd, gap: spacing.stackMd }}>
        {jobs.length === 0 ? (
          <EmptyState label={t('freelancer.noOpenJobs')} />
        ) : (
          jobs.map((job) => (
            <View
              key={job.id}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.cardPaddingCompact,
                gap: spacing.stackSm,
              }}
            >
              <Text className="font-semibold" style={{ color: colors.foreground }}>
                {job.title}
              </Text>
              <Text className="text-sm leading-5" style={{ color: colors.muted }} numberOfLines={2}>
                {job.description}
              </Text>
              <View className="flex-row flex-wrap items-center justify-between gap-2">
                <View className="flex-row items-center gap-1">
                  <Building2 size={14} color={colors.muted} strokeWidth={2} />
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    {job.postedBy.name ?? job.postedBy.email}
                  </Text>
                </View>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  {formatJobAmount(job.amount, job.currency)}
                </Text>
              </View>
              {onAcceptJob ? (
                acceptingJobId === job.id ? (
                  <View style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : (
                  <Button
                    label={t('freelancer.acceptJob')}
                    size="md"
                    onPress={() => onAcceptJob(job.id)}
                  />
                )
              ) : null}
            </View>
          ))
        )}
      </View>
    </Card>
  );
}
