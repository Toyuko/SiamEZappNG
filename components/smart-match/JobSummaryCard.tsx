import { Text, View } from 'react-native';

import { CATEGORY_LABELS, EXPERIENCE_LABELS, URGENCY_LABELS } from '../../features/matching/matching.constants';
import { formatBaht } from '../../features/matching/matching.scoring';
import type { Job } from '../../features/matching/matching.types';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { Card } from '../ui/Card';

export function JobSummaryCard({ job, matchScore }: { job: Job; matchScore?: number }) {
  const { colors } = useTheme();
  const budget =
    job.budgetMin != null && job.budgetMax != null
      ? `${formatBaht(job.budgetMin)} – ${formatBaht(job.budgetMax)}`
      : job.budgetMax != null
        ? formatBaht(job.budgetMax)
        : 'Open budget';

  return (
    <Card>
      <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 18 }}>{job.title}</Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>{CATEGORY_LABELS[job.category]}</Text>
      {matchScore != null ? (
        <View
          style={{
            alignSelf: 'flex-start',
            marginTop: 10,
            backgroundColor: 'rgba(44,84,198,0.12)',
            borderRadius: radius.full,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: colors.primary, fontWeight: '800' }}>{matchScore}% AI MATCH</Text>
        </View>
      ) : null}
      <View style={{ gap: 6, marginTop: spacing.stackMd }}>
        <Text style={{ color: colors.foreground }}>📍 {job.location}</Text>
        <Text style={{ color: colors.foreground }}>📅 {job.specificDate || URGENCY_LABELS[job.urgency]}</Text>
        <Text style={{ color: colors.foreground }}>💰 {budget}</Text>
        <Text style={{ color: colors.foreground }}>⭐ Preferred: {EXPERIENCE_LABELS[job.experienceRequired]}</Text>
      </View>
      <Text style={{ color: colors.muted, marginTop: 12, lineHeight: 20 }}>{job.description}</Text>
    </Card>
  );
}
