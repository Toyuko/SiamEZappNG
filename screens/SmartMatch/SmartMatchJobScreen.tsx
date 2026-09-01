import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { JobSummaryCard } from '../../components/smart-match/JobSummaryCard';
import { WhyThisMatch } from '../../components/smart-match/WhyThisMatch';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { calculateMatchScore } from '../../features/matching/matching.scoring';
import { findFreelancer } from '../../features/matching/matching.service';
import { useMatchingStore } from '../../features/matching/matching.store';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function SmartMatchJobScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = useMatchingStore((s) => s.jobs.find((item) => item.id === id) ?? null);
  const viewerFreelancerId = useMatchingStore((s) => s.viewerFreelancerId);
  const acceptJob = useMatchingStore((s) => s.acceptJob);
  const rejectJob = useMatchingStore((s) => s.rejectJob);
  const freelancer = findFreelancer(viewerFreelancerId);

  if (!job) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16 }}>
          <PageHeader title="Job" subtitle="Not found" onBack={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const result = freelancer ? calculateMatchScore(job, freelancer) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.stackLg, paddingBottom: 40 }}>
        <PageHeader title="Job" subtitle={job.clientName} onBack={() => router.back()} />
        <DemoModeBanner />
        <JobSummaryCard job={job} matchScore={result?.score} />
        {result ? (
          <Card>
            <WhyThisMatch result={result} />
          </Card>
        ) : null}
        <Button
          label="Accept"
          gradient
          onPress={() => {
            acceptJob(job.id);
            router.back();
          }}
        />
        <Button
          label="Pass"
          variant="secondary"
          onPress={() => {
            rejectJob(job.id);
            router.back();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
