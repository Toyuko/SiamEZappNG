import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPicker } from '../../components/smart-match/CategoryPicker';
import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { DEMO_JOB_PRESETS, MOCK_FREELANCERS } from '../../features/matching/matching.mock-data';
import { useMatchingStore } from '../../features/matching/matching.store';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function SmartMatchHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const role = useMatchingStore((s) => s.role);
  const switchRole = useMatchingStore((s) => s.switchRole);
  const loadDemoJob = useMatchingStore((s) => s.loadDemoJob);
  const resetDemo = useMatchingStore((s) => s.resetDemo);
  const matches = useMatchingStore((s) => s.matches);
  const matchedCount = matches.filter((item) => item.status === 'matched').length;
  const viewerFreelancerId = useMatchingStore((s) => s.viewerFreelancerId);
  const switchFreelancerPersona = useMatchingStore((s) => s.switchFreelancerPersona);

  const runPreset = (jobId: string) => {
    const job = loadDemoJob(jobId);
    if (job) router.push('/smart-match/deck');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 40 }}>
        <PageHeader
          title="SiamEZ Smart Match"
          subtitle="AI-powered job ↔ freelancer matching. Swipe to hire — LinkedIn quality, Tinder speed."
          badge="DEMO MODE"
          onBack={() => router.back()}
          primaryCta={{ label: 'Try AI Matching', onPress: () => router.push('/smart-match/create') }}
          secondaryCta={{ label: 'Create a job', onPress: () => router.push('/smart-match/create') }}
        />

        <DemoModeBanner onReset={resetDemo} />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['client', 'freelancer'] as const).map((item) => {
            const active = role === item;
            return (
              <Pressable
                key={item}
                onPress={() => switchRole(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: radius.button,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? siam.blue.DEFAULT : colors.card,
                  borderWidth: 1,
                  borderColor: active ? siam.blue.DEFAULT : colors.border,
                }}
              >
                <Text style={{ color: active ? '#fff' : colors.foreground, fontWeight: '800' }}>
                  {item === 'client' ? 'Client demo' : 'Freelancer demo'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {role === 'client' ? (
          <>
            <Card>
              <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '800' }}>Choose your freelancer.</Text>
              <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
                Create a job or pick a pre-built request. The simulated AI ranks professionals on skills, location,
                experience, availability, budget, rating, and language — never appearance or demographics.
              </Text>
              <View style={{ marginTop: 16, gap: 10 }}>
                {DEMO_JOB_PRESETS.map((preset) => (
                  <Button key={preset.id} label={preset.label} variant="secondary" onPress={() => runPreset(preset.id)} />
                ))}
              </View>
            </Card>
            <Card>
              <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 16 }}>Many skills, one platform</Text>
              <Text style={{ color: colors.muted, marginTop: 6, marginBottom: 12 }}>
                Tap a category to start a job with that service already selected.
              </Text>
              <CategoryPicker
                value={null}
                onChange={(category) => {
                  router.push(`/smart-match/create?category=${category}`);
                }}
              />
            </Card>
          </>
        ) : (
          <Card>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '800' }}>Smart job matches</Text>
            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
              Browse as a freelancer. Jobs are ranked with the same engine used for client matching.
            </Text>
            <Text style={{ color: colors.foreground, marginTop: 16, fontWeight: '700' }}>Demo persona</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {MOCK_FREELANCERS.slice(0, 8).map((freelancer) => {
                const active = freelancer.id === viewerFreelancerId;
                return (
                  <Pressable
                    key={freelancer.id}
                    onPress={() => switchFreelancerPersona(freelancer.id)}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: active ? siam.yellow.DEFAULT : colors.border,
                      backgroundColor: active ? 'rgba(44,84,198,0.08)' : colors.background,
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontWeight: '700' }}>
                      {freelancer.name} · {freelancer.location}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>{freelancer.skills.slice(0, 3).join(' · ')}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ marginTop: 16 }}>
              <Button label="Open job deck" onPress={() => router.push('/smart-match/freelancer-deck')} gradient />
            </View>
          </Card>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <Button
            label={`Matches (${matchedCount})`}
            variant="secondary"
            fullWidth={false}
            onPress={() => router.push('/smart-match/matches')}
          />
          <Button
            label="Inspector"
            variant="secondary"
            fullWidth={false}
            onPress={() => router.push('/smart-match/inspector')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
