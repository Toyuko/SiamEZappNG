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
          subtitle="Developer/demo view of the two-sided preference engine."
          onBack={() => router.back()}
        />
        <DemoModeBanner />
        <Text style={{ color: colors.muted }}>
          Weights: job fit 40%, client preferences 20%, freelancer preferences 15%, location 10%, availability 5%,
          price 5%, reputation 5%. MUST HAVE + not flexible = match blocked (score capped).
        </Text>
        {role === 'freelancer' ? (
          <InspectorPanel items={freelancerRows} jobTitle="Jobs ranked for your persona" />
        ) : (
          <InspectorPanel items={clientRows} jobTitle={job?.title} />
        )}
        <Button label="Back to Smart Match" variant="secondary" onPress={() => router.push('/smart-match')} />
      </ScrollView>
    </SafeAreaView>
  );
}
