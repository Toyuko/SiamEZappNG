import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { JobSummaryCard } from '../../components/smart-match/JobSummaryCard';
import { MatchActionBar } from '../../components/smart-match/MatchActionBar';
import { MatchCelebration } from '../../components/smart-match/MatchCelebration';
import { WhyThisMatch } from '../../components/smart-match/WhyThisMatch';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { CATEGORY_LABELS } from '../../features/matching/matching.constants';
import { findFreelancer } from '../../features/matching/matching.service';
import { useFreelancerDeck, useMatchingStore } from '../../features/matching/matching.store';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function FreelancerDeckScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const deck = useFreelancerDeck();
  const current = deck[0] ?? null;
  const viewerFreelancerId = useMatchingStore((s) => s.viewerFreelancerId);
  const celebration = useMatchingStore((s) => s.lastCelebration);
  const acceptJob = useMatchingStore((s) => s.acceptJob);
  const rejectJob = useMatchingStore((s) => s.rejectJob);
  const undo = useMatchingStore((s) => s.undo);
  const saveProfile = useMatchingStore((s) => s.saveProfile);
  const clearCelebration = useMatchingStore((s) => s.clearCelebration);
  const bookMatch = useMatchingStore((s) => s.bookMatch);
  const resetDemo = useMatchingStore((s) => s.resetDemo);
  const history = useMatchingStore((s) => s.history);
  const me = findFreelancer(viewerFreelancerId);
  const [hint, setHint] = useState<string | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 40 }}>
        <PageHeader
          title="Smart job matches"
          subtitle={
            me
              ? `Browsing as ${me.name} · ${CATEGORY_LABELS[me.category]} · ${deck.length} AI-ranked jobs`
              : 'Pick a freelancer persona on the Smart Match home.'
          }
          onBack={() => router.back()}
          badge="FREELANCER DEMO"
          secondaryCta={{ label: 'Work preferences', onPress: () => router.push('/smart-match/work-preferences') }}
        />
        <DemoModeBanner onReset={resetDemo} />

        {!current ? (
          <Card>
            <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 18 }}>No open jobs left</Text>
            <Text style={{ color: colors.muted, marginTop: 8 }}>
              Switch persona or reset the demo to see new opportunities.
            </Text>
            <View style={{ marginTop: 12 }}>
              <Button label="Back to Smart Match" onPress={() => router.push('/smart-match')} />
            </View>
          </Card>
        ) : (
          <>
            <JobSummaryCard job={current.job} matchScore={current.result.score} />
            <Card>
              <WhyThisMatch result={current.result} />
            </Card>
            {hint ? <Text style={{ color: colors.primary, fontWeight: '700' }}>{hint}</Text> : null}
            <MatchActionBar
              disableUndo={history.length === 0}
              onUndo={undo}
              onPass={() => rejectJob(current.job.id)}
              onSave={() => {
                saveProfile(current.freelancer.id);
                setHint('Job saved to your shortlist.');
              }}
              onLike={() => acceptJob(current.job.id)}
              onSuper={() => acceptJob(current.job.id)}
            />
            <Button
              label="View full job"
              variant="secondary"
              onPress={() => router.push(`/smart-match/job/${current.job.id}`)}
            />
          </>
        )}
      </ScrollView>
      {celebration ? (
        <MatchCelebration
          payload={celebration}
          onChat={() => {
            clearCelebration();
            router.push(`/smart-match/chat/${encodeURIComponent(celebration.matchId)}`);
          }}
          onBook={() => {
            bookMatch(celebration.matchId);
            clearCelebration();
            router.push(`/smart-match/chat/${encodeURIComponent(celebration.matchId)}?booked=1`);
          }}
          onContinue={clearCelebration}
        />
      ) : null}
    </SafeAreaView>
  );
}
