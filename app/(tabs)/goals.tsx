import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoalStatus,
} from '../../hooks/use-goals';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function GoalsScreen() {
  const { colors } = useTheme();
  const goalsQuery = useGoals();
  const createGoal = useCreateGoal();
  const updateStatus = useUpdateGoalStatus();
  const deleteGoal = useDeleteGoal();
  const [title, setTitle] = useState('');

  if (goalsQuery.isLoading) {
    return <LoadingState label="Loading goals…" />;
  }

  if (goalsQuery.isError) {
    return (
      <ErrorState
        label={
          goalsQuery.error instanceof Error
            ? goalsQuery.error.message
            : 'Unable to load goals'
        }
        onRetry={() => void goalsQuery.refetch()}
      />
    );
  }

  const goals = goalsQuery.data ?? [];

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
          title="Goals"
          subtitle="Synced with your SiamEZ Platform portal."
        />

        <Card>
          <Text className="mb-2 text-sm font-semibold" style={{ color: colors.foreground }}>
            New goal
          </Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Buy motorcycle in Bangkok"
          />
          <View className="mt-3">
            <Button
              label={createGoal.isPending ? 'Saving…' : 'Add goal'}
              onPress={() => {
                const trimmed = title.trim();
                if (!trimmed) {
                  Alert.alert('Title required');
                  return;
                }
                createGoal.mutate(
                  { title: trimmed },
                  {
                    onSuccess: () => setTitle(''),
                    onError: (err) =>
                      Alert.alert(
                        'Could not create goal',
                        err instanceof Error ? err.message : 'Try again'
                      ),
                  }
                );
              }}
            />
          </View>
        </Card>

        {goals.length === 0 ? (
          <Card>
            <Text className="text-sm" style={{ color: colors.muted }}>
              No goals yet. Create one to track progress across the platform.
            </Text>
          </Card>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id}>
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {goal.title}
              </Text>
              <Text className="mt-1 text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
                {goal.status} · {goal.progressPct}%
              </Text>
              {goal.lifeEvent ? (
                <Text className="mt-2 text-sm" style={{ color: colors.muted }}>
                  Linked: {goal.lifeEvent.titleEn}
                </Text>
              ) : null}
              <View className="mt-3 flex-row flex-wrap gap-2">
                {goal.status === 'active' ? (
                  <Pressable
                    onPress={() =>
                      updateStatus.mutate({ goalId: goal.id, status: 'completed' })
                    }
                    className="rounded-lg px-3 py-2"
                    style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      Mark complete
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => deleteGoal.mutate(goal.id)}
                  className="rounded-lg px-3 py-2"
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.muted }}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
