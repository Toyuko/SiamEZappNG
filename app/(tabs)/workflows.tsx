import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import {
  advanceWorkflowStep,
  cancelWorkflow,
  fetchMyWorkflowRuns,
  fetchWorkflowTemplates,
  startWorkflow,
} from '../../features/workflows/workflows.api';
import { fetchFeatureFlags } from '../../features/feature-flags/feature-flags.api';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function WorkflowsScreen() {
  const { colors } = useTheme();
  const language = useLanguageStore((s) => s.language);
  const qc = useQueryClient();
  const flagsQuery = useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlags,
  });
  const templatesQuery = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: fetchWorkflowTemplates,
  });
  const runsQuery = useQuery({
    queryKey: ['workflow-runs'],
    queryFn: fetchMyWorkflowRuns,
  });
  const start = useMutation({
    mutationFn: startWorkflow,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workflow-runs'] }),
  });
  const advance = useMutation({
    mutationFn: advanceWorkflowStep,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workflow-runs'] }),
  });
  const cancel = useMutation({
    mutationFn: cancelWorkflow,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['workflow-runs'] }),
  });

  if (templatesQuery.isLoading || runsQuery.isLoading) {
    return <LoadingState label="Loading workflows…" />;
  }

  if (templatesQuery.isError || runsQuery.isError) {
    const err = templatesQuery.error ?? runsQuery.error;
    return (
      <ErrorState
        label={err instanceof Error ? err.message : 'Unable to load workflows'}
        onRetry={() => {
          void templatesQuery.refetch();
          void runsQuery.refetch();
        }}
      />
    );
  }

  const workflowsEnabled = flagsQuery.data?.new_workflows !== false;
  const templates = templatesQuery.data ?? [];
  const runs = runsQuery.data ?? [];

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
          title="Workflows"
          subtitle="Universal workflow templates from Platform 2.1."
        />

        {!workflowsEnabled ? (
          <Card>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Workflows are currently disabled by a feature flag.
            </Text>
          </Card>
        ) : null}

        <Section title="Your runs" subtitle="Continue where you left off">
          {runs.length === 0 ? (
            <Card>
              <Text className="text-sm" style={{ color: colors.muted }}>
                No workflow runs yet. Start a template below.
              </Text>
            </Card>
          ) : (
            runs.map((run) => {
              const title =
                language === 'th' && run.template?.titleTh
                  ? run.template.titleTh
                  : run.template?.titleEn ?? 'Workflow';
              return (
                <Card key={run.id}>
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    {title}
                  </Text>
                  <Text className="mt-1 text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
                    {run.status}
                  </Text>
                  {run.status !== 'cancelled' && run.status !== 'completed' && run.status !== 'canceled' ? (
                    <View className="mt-2">
                      <Button
                        label={cancel.isPending ? 'Cancelling…' : 'Cancel workflow'}
                        variant="secondary"
                        size="md"
                        onPress={() =>
                          cancel.mutate(run.id, {
                            onError: (e) =>
                              Alert.alert(
                                'Could not cancel',
                                e instanceof Error ? e.message : 'Try again'
                              ),
                          })
                        }
                      />
                    </View>
                  ) : null}
                  <View className="mt-3 gap-2">
                    {(run.steps ?? []).map((step) => {
                      const stepTitle =
                        language === 'th' && step.templateStep?.titleTh
                          ? step.templateStep.titleTh
                          : step.templateStep?.titleEn ?? 'Step';
                      return (
                        <Pressable
                          key={step.id}
                          onPress={() => {
                            if (step.status === 'pending' || step.status === 'in_progress') {
                              advance.mutate(step.id, {
                                onError: (e) =>
                                  Alert.alert(
                                    'Could not advance',
                                    e instanceof Error ? e.message : 'Try again'
                                  ),
                              });
                            }
                          }}
                          className="rounded-xl border px-3 py-2"
                          style={{ borderColor: colors.border }}
                        >
                          <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                            {stepTitle}
                          </Text>
                          <Text className="mt-0.5 text-xs capitalize" style={{ color: colors.muted }}>
                            {step.status}
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

        <Section title="Templates" subtitle="Inspection, viewing, and more">
          {templates.map((template) => {
            const title =
              language === 'th' && template.titleTh
                ? template.titleTh
                : template.titleEn;
            return (
              <Card key={template.id}>
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  {title}
                </Text>
                {template.descriptionEn ? (
                  <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
                    {language === 'th' && template.descriptionTh
                      ? template.descriptionTh
                      : template.descriptionEn}
                  </Text>
                ) : null}
                <View className="mt-3">
                  <Button
                    label={start.isPending ? 'Starting…' : 'Start workflow'}
                    onPress={() =>
                      start.mutate(template.id, {
                        onError: (e) =>
                          Alert.alert(
                            'Could not start',
                            e instanceof Error ? e.message : 'Try again'
                          ),
                      })
                    }
                  />
                </View>
              </Card>
            );
          })}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
