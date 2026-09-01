import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { JobSummaryCard } from '../../components/smart-match/JobSummaryCard';
import { MatchActionBar } from '../../components/smart-match/MatchActionBar';
import { MatchCelebration } from '../../components/smart-match/MatchCelebration';
import { MatchFilterBar } from '../../components/smart-match/MatchFilterBar';
import { SwipeDeck } from '../../components/smart-match/SwipeDeck';
import { WhyThisMatch } from '../../components/smart-match/WhyThisMatch';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { STRONG_MATCH_MIN } from '../../features/matching/matching.constants';
import { useClientDeck, useMatchingStore } from '../../features/matching/matching.store';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function ClientDeckScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= 960;
  const [showWeak, setShowWeak] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [action, setAction] = useState<{ type: 'like' | 'pass' | 'super'; token: number } | null>(null);

  const role = useMatchingStore((s) => s.role);
  const currentJobId = useMatchingStore((s) => s.currentJobId);
  const learnedHints = useMatchingStore((s) => s.clientProfile.learnedHints);
  const pendingHints = learnedHints.filter((hint) => !hint.confirmed);
  const acceptLearnedHint = useMatchingStore((s) => s.acceptLearnedHint);
  const job = useMatchingStore((s) => s.jobs.find((item) => item.id === s.currentJobId) ?? null);
  const filters = useMatchingStore((s) => s.filters);
  const celebration = useMatchingStore((s) => s.lastCelebration);
  const history = useMatchingStore((s) => s.history);
  const likeCurrentFreelancer = useMatchingStore((s) => s.likeCurrentFreelancer);
  const passCurrentFreelancer = useMatchingStore((s) => s.passCurrentFreelancer);
  const superLikeFreelancer = useMatchingStore((s) => s.superLikeFreelancer);
  const saveProfile = useMatchingStore((s) => s.saveProfile);
  const undo = useMatchingStore((s) => s.undo);
  const updateFilters = useMatchingStore((s) => s.updateFilters);
  const resetDemo = useMatchingStore((s) => s.resetDemo);
  const clearCelebration = useMatchingStore((s) => s.clearCelebration);
  const bookMatch = useMatchingStore((s) => s.bookMatch);
  const allRanked = useClientDeck();
  const strong = allRanked.filter((item) => item.result.score >= STRONG_MATCH_MIN);
  const deck = showWeak ? allRanked : strong;
  const current = deck[0] ?? null;

  const headerCopy = useMemo(() => {
    if (!job) return 'Create a job to generate matches.';
    if (allRanked.length === 0) return 'No professionals left in this deck.';
    if (strong.length === 0) return 'No strong matches for your hiring criteria.';
    return `AI ranked ${strong.length} professional${strong.length === 1 ? '' : 's'} against your requirements`;
  }, [allRanked.length, job, strong.length]);

  if (!job || !currentJobId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16, gap: 16 }}>
          <PageHeader title="Matches" subtitle="Create a job first." onBack={() => router.back()} />
          <Button label="Create a job" onPress={() => router.push('/smart-match/create')} />
        </View>
      </SafeAreaView>
    );
  }

  const onCelebrateChat = () => {
    if (!celebration) return;
    clearCelebration();
    router.push(`/smart-match/chat/${encodeURIComponent(celebration.matchId)}`);
  };
  const onCelebrateBook = () => {
    if (!celebration) return;
    bookMatch(celebration.matchId);
    clearCelebration();
    router.push(`/smart-match/chat/${encodeURIComponent(celebration.matchId)}?booked=1`);
  };

  const cardColumn = (
    <View style={{ flex: 1, minHeight: 520, gap: 8 }}>
      <View style={{ flex: 1, minHeight: 440 }}>
        {deck.length > 0 ? (
          <SwipeDeck
            items={deck}
            programmaticAction={action}
            onLike={(id) => likeCurrentFreelancer(id)}
            onPass={(id) => passCurrentFreelancer(id)}
            onSuper={(id) => superLikeFreelancer(id)}
            onOpenProfile={(id) => router.push(`/smart-match/profile/${id}`)}
          />
        ) : (
          <Card>
            <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 18 }}>
              {strong.length === 0 && allRanked.length > 0 ? 'No strong matches found.' : 'Deck complete'}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
              {strong.length === 0 && allRanked.length > 0
                ? 'Try expanding location, increasing budget, or relaxing experience.'
                : 'You have reviewed everyone for this job.'}
            </Text>
            {strong.length === 0 && allRanked.length > 0 ? (
              <View style={{ marginTop: 12, gap: 8 }}>
                {['Expand your location', 'Increase your budget', 'Relax experience requirements'].map((hint) => (
                  <Text key={hint} style={{ color: colors.foreground }}>
                    • {hint}
                  </Text>
                ))}
                <Button label="Show all matches" variant="secondary" onPress={() => setShowWeak(true)} />
              </View>
            ) : (
              <View style={{ marginTop: 12 }}>
                <Button label="Create another job" onPress={() => router.push('/smart-match/create')} />
              </View>
            )}
          </Card>
        )}
      </View>
      {deck.length > 0 ? (
        <MatchActionBar
          mode={role === 'corporate' ? 'corporate' : 'client'}
          disableUndo={history.length === 0}
          onUndo={() => undo()}
          onPass={() => setAction({ type: 'pass', token: Date.now() })}
          onSave={() => {
            if (role === 'corporate') {
              router.push('/smart-match/pipeline');
              return;
            }
            current && saveProfile(current.freelancer.id);
          }}
          onLike={() => setAction({ type: 'like', token: Date.now() })}
          onSuper={() => setAction({ type: 'super', token: Date.now() })}
        />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.stackLg, paddingBottom: 40 }}>
        <PageHeader
          title={role === 'corporate' ? 'Candidate shortlist' : 'AI-ranked professionals'}
          subtitle={headerCopy}
          onBack={() => router.back()}
          badge="DEMO MODE"
        />
        <DemoModeBanner onReset={() => resetDemo()} />
        {pendingHints.map((hint) => (
          <Card key={hint.id}>
            <Text style={{ color: colors.foreground, fontWeight: '700' }}>{hint.text}</Text>
            <View style={{ marginTop: 10 }}>
              <Button label="Use this preference" onPress={() => acceptLearnedHint(hint.id)} />
            </View>
          </Card>
        ))}

        {desktop ? (
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start', minHeight: 640 }}>
            <View style={{ width: 280, gap: 12 }}>
              <JobSummaryCard job={job} />
              <Button label="Filters" variant="secondary" onPress={() => setFiltersOpen((v) => !v)} />
              {filtersOpen ? <MatchFilterBar filters={filters} onChange={updateFilters} /> : null}
            </View>
            <View style={{ flex: 1, minHeight: 560 }}>{cardColumn}</View>
            <View style={{ width: 300 }}>
              {current ? (
                <Card>
                  <WhyThisMatch result={current.result} />
                </Card>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={{ gap: 12, minHeight: 640 }}>
            {cardColumn}
            {current ? (
              <Card>
                <WhyThisMatch result={current.result} compact />
              </Card>
            ) : null}
            <Pressable onPress={() => setFiltersOpen((v) => !v)} accessibilityRole="button">
              <Text style={{ color: colors.primary, fontWeight: '800' }}>{filtersOpen ? 'Hide filters' : 'Show filters'}</Text>
            </Pressable>
            {filtersOpen ? <MatchFilterBar filters={filters} onChange={updateFilters} /> : null}
          </View>
        )}
      </ScrollView>
      {celebration ? (
        <MatchCelebration
          payload={celebration}
          onChat={onCelebrateChat}
          onBook={onCelebrateBook}
          onContinue={() => clearCelebration()}
        />
      ) : null}
    </SafeAreaView>
  );
}
