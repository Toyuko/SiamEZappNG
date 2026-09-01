import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { InspectorPanel } from '../../components/smart-match/InspectorPanel';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { useClientDeck, useFreelancerDeck, useMatchingStore } from '../../features/matching/matching.store';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function SmartMatchInspectorScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const role = useMatchingStore((s) => s.role);
  const job = useMatchingStore((s) => s.jobs.find((item) => item.id === s.currentJobId) ?? s.jobs[0] ?? null);
  const clientRows = useClientDeck();
  const freelancerRows = useFreelancerDeck();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.stackLg, paddingBottom: 40 }}>
        <PageHeader
          title="Matching inspector"
          subtitle="Developer/demo view of the weighted scoring engine."
          onBack={() => router.back()}
        />
        <DemoModeBanner />
        <Text style={{ color: colors.muted }}>
          Weights: skills 35%, location 20%, experience 15%, availability 10%, budget 10%, rating 5%, language 5%.
        </Text>
        {role === 'client' ? (
          <InspectorPanel items={clientRows} jobTitle={job?.title} />
        ) : (
          <InspectorPanel items={freelancerRows} jobTitle="Jobs ranked for your persona" />
        )}
        <Button label="Back to Smart Match" variant="secondary" onPress={() => router.push('/smart-match')} />
      </ScrollView>
    </SafeAreaView>
  );
}
