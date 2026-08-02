import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import {
  useLifeEventRuns,
  useLifeEventsCatalog,
  useStartLifeEvent,
  useUpdateLifeEventStep,
} from '../../hooks/use-life-events';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import type { LifeEventRun } from '../../features/life-events/life-events.types';

function progressPercent(run: LifeEventRun) {
  const total = run.lifeEvent.steps.length || 1;
  const done = run.steps.filter(
    (s) => s.status === 'completed' || s.status === 'skipped'
  ).length;
  return Math.round((done / total) * 100);
}

export default function LifeEventsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((s) => s.language);
  const catalogQuery = useLifeEventsCatalog();
  const runsQuery = useLifeEventRuns();
  const startEvent = useStartLifeEvent();
  const updateStep = useUpdateLifeEventStep();

  const activeRunIds = useMemo(
    () => new Set((runsQuery.data ?? []).map((r) => r.lifeEventId)),
    [runsQuery.data]
  );

  if (catalogQuery.isLoading || runsQuery.isLoading) {
    return <LoadingState label="Loading life events…" />;
  }

  if (catalogQuery.isError || runsQuery.isError) {
    const err = catalogQuery.error ?? runsQuery.error;
    return (
      <ErrorState
        label={err instanceof Error ? err.message : 'Unable to load life events'}
        onRetry={() => {
          void catalogQuery.refetch();
          void runsQuery.refetch();
        }}
      />
    );
  }

  const runs = runsQuery.data ?? [];
  const catalog = catalogQuery.data ?? [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: spacing.sectionGap,
          paddingBottom: 40,
        }}
      >
        <PageHeader
          title="Life Events"
          subtitle="Journeys synced with the Platform — progress carries across devices."
        />

        <Section title="Your progress" subtitle="Active and recent journeys">
          {runs.length === 0 ? (
            <Card>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Start a life event below to track checklist progress.
              </Text>
            </Card>
          ) : (
            runs.map((run) => {
              const title =
                language === 'th' && run.lifeEvent.titleTh
                  ? run.lifeEvent.titleTh
                  : run.lifeEvent.titleEn;
              const pct = progressPercent(run);
              return (
                <Card key={run.id}>
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    {title}
                  </Text>
                  <Text className="mt-1 text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
                    {run.status} · {pct}%
                  </Text>
                  <View className="mt-3 gap-2">
                    {run.lifeEvent.steps.map((step) => {
                      const stepProgress = run.steps.find((s) => s.stepId === step.id);
                      const status = stepProgress?.status ?? 'pending';
                      const stepTitle =
                        language === 'th' && step.titleTh ? step.titleTh : step.titleEn;
                      return (
                        <Pressable
                          key={step.id}
                          onPress={() => {
                            const next =
                              status === 'pending'
                                ? 'started'
                                : status === 'started'
                                  ? 'completed'
                                  : status;
                            if (next === status) return;
                            updateStep.mutate({
                              progressId: run.id,
                              stepId: step.id,
                              status: next,
                            });
                          }}
                          className="rounded-xl border px-3 py-2"
                          style={{ borderColor: colors.border }}
                        >
                          <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                            {stepTitle}
                          </Text>
                          <Text className="mt-0.5 text-xs capitalize" style={{ color: colors.muted }}>
                            {status} · tap to advance
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Card>
              );
            })
          )}
        </Section>

        <Section title="Available journeys" subtitle="Start from the Platform catalog">
          {catalog.map((event) => {
            const title =
              language === 'th' && event.titleTh ? event.titleTh : event.titleEn;
            const description =
              language === 'th' && event.descriptionTh
                ? event.descriptionTh
                : event.descriptionEn;
            const alreadyStarted = activeRunIds.has(event.id);
            return (
              <Card key={event.id}>
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  {title}
                </Text>
                {description ? (
                  <Text className="mt-1 text-sm leading-5" style={{ color: colors.muted }}>
                    {description}
                  </Text>
                ) : null}
                <Text className="mt-2 text-xs" style={{ color: colors.muted }}>
                  {event.steps.length} steps
                </Text>
                <View className="mt-3">
                  <Button
                    label={
                      alreadyStarted
                        ? 'Already started'
                        : startEvent.isPending
                          ? 'Starting…'
                          : 'Start journey'
                    }
                    variant={alreadyStarted ? 'secondary' : 'primary'}
                    onPress={() => {
                      if (alreadyStarted) return;
                      startEvent.mutate(event.id, {
                        onError: (err) =>
                          Alert.alert(
                            'Could not start',
                            err instanceof Error ? err.message : 'Try again'
                          ),
                      });
                    }}
                  />
                </View>
              </Card>
            );
          })}
        </Section>

        <Button
          label="View goals"
          variant="secondary"
          onPress={() => router.push('/(tabs)/goals')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
