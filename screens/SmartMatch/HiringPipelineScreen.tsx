import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { PIPELINE_LABELS, PIPELINE_STAGES } from '../../features/matching/matching.constants';
import { findFreelancer } from '../../features/matching/matching.service';
import { useMatchingStore } from '../../features/matching/matching.store';
import type { HiringPipelineStage } from '../../features/matching/matching.types';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const FLOW: HiringPipelineStage[] = [...PIPELINE_STAGES];

export function HiringPipelineScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const matches = useMatchingStore((s) => s.matches);
  const pipeline = useMatchingStore((s) => s.pipeline);
  const advancePipeline = useMatchingStore((s) => s.advancePipeline);
  const jobs = useMatchingStore((s) => s.jobs);

  const rows = matches.filter((item) => item.clientAction !== 'passed' || pipeline[item.id] === 'rejected');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 48 }}>
        <PageHeader
          title="Hiring pipeline"
          subtitle="Discovered → Shortlisted → Contacted → Interview → Offer → Hired"
          onBack={() => router.back()}
        />
        <DemoModeBanner />

        {FLOW.map((stage) => {
          const stageRows = rows.filter((item) => (pipeline[item.id] ?? 'discovered') === stage);
          return (
            <Card key={stage}>
              <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 16 }}>
                {PIPELINE_LABELS[stage]} ({stageRows.length})
              </Text>
              {stageRows.length === 0 ? (
                <Text style={{ color: colors.muted, marginTop: 8 }}>No candidates in this stage.</Text>
              ) : (
                stageRows.map((item) => {
                  const freelancer = findFreelancer(item.freelancerId);
                  const job = jobs.find((entry) => entry.id === item.jobId);
                  const index = FLOW.indexOf(stage);
                  const next = FLOW[index + 1];
                  return (
                    <View
                      key={item.id}
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        gap: 8,
                      }}
                    >
                      <Text style={{ color: colors.foreground, fontWeight: '800' }}>
                        {freelancer?.name ?? item.freelancerId} · {item.score}%
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>{job?.title}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {next ? (
                          <Pressable
                            onPress={() => advancePipeline(item.id, next)}
                            style={{
                              backgroundColor: siam.blue.DEFAULT,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 999,
                            }}
                          >
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>Move to {PIPELINE_LABELS[next]}</Text>
                          </Pressable>
                        ) : null}
                        <Pressable
                          onPress={() => router.push(`/smart-match/chat/${encodeURIComponent(item.id)}`)}
                          style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 999,
                          }}
                        >
                          <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 12 }}>Contact</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => advancePipeline(item.id, 'rejected')}
                          style={{
                            borderWidth: 1,
                            borderColor: '#ef4444',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 999,
                          }}
                        >
                          <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 12 }}>Reject</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
            </Card>
          );
        })}

        <Button label="Back to Smart Match" variant="secondary" onPress={() => router.push('/smart-match')} />
      </ScrollView>
    </SafeAreaView>
  );
}
