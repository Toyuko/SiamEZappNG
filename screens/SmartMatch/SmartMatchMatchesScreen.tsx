import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { CATEGORY_LABELS } from '../../features/matching/matching.constants';
import { findFreelancer } from '../../features/matching/matching.service';
import { useMatchingStore } from '../../features/matching/matching.store';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function SmartMatchMatchesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const allMatches = useMatchingStore((s) => s.matches);
  const matches = allMatches.filter((item) => item.status === 'matched');
  const jobs = useMatchingStore((s) => s.jobs);
  const bookings = useMatchingStore((s) => s.bookings);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.stackMd, paddingBottom: 40 }}>
        <PageHeader title="Your matches" subtitle="Mutual likes become conversations and bookings." onBack={() => router.back()} />
        <DemoModeBanner />
        {matches.length === 0 ? <EmptyState label="No matches yet. Like a freelancer who also accepts the job." /> : null}
        {matches.map((match) => {
          const freelancer = findFreelancer(match.freelancerId);
          const job = jobs.find((item) => item.id === match.jobId);
          const booked = bookings.some((item) => item.matchId === match.id);
          return (
            <Pressable
              key={match.id}
              onPress={() => router.push(`/smart-match/chat/${encodeURIComponent(match.id)}`)}
            >
              <Card>
                <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 16 }}>
                  {freelancer?.name ?? 'Freelancer'} · {match.score}%
                </Text>
                <Text style={{ color: colors.muted, marginTop: 4 }}>
                  {job?.title ?? CATEGORY_LABELS[freelancer?.category ?? 'driver']}
                  {booked ? ' · Booking confirmed' : ''}
                </Text>
                <Text style={{ color: colors.primary, marginTop: 8, fontWeight: '700' }}>Open chat</Text>
              </Card>
            </Pressable>
          );
        })}
        <Button label="Keep browsing" variant="secondary" onPress={() => router.push('/smart-match/deck')} />
      </ScrollView>
    </SafeAreaView>
  );
}
