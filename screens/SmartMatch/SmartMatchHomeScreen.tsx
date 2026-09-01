import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPicker } from '../../components/smart-match/CategoryPicker';
import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { DEMO_JOB_PRESETS, DEMO_SCENARIOS, MOCK_FREELANCERS } from '../../features/matching/matching.mock-data';
import { useMatchingStore } from '../../features/matching/matching.store';
import type { DemoRole } from '../../features/matching/matching.types';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const ROLES: { id: DemoRole; label: string }[] = [
  { id: 'client', label: 'Individual' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'freelancer', label: 'Freelancer' },
];

export function SmartMatchHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const role = useMatchingStore((s) => s.role);
  const switchRole = useMatchingStore((s) => s.switchRole);
  const loadDemoJob = useMatchingStore((s) => s.loadDemoJob);
  const runDemoScenario = useMatchingStore((s) => s.runDemoScenario);
  const resetDemo = useMatchingStore((s) => s.resetDemo);
  const matches = useMatchingStore((s) => s.matches);
  const matchedCount = matches.filter((item) => item.status === 'matched').length;
  const viewerFreelancerId = useMatchingStore((s) => s.viewerFreelancerId);
  const switchFreelancerPersona = useMatchingStore((s) => s.switchFreelancerPersona);
  const companyName = useMatchingStore((s) => s.corporateAccount.companyName);

  const runPreset = (jobId: string) => {
    const job = loadDemoJob(jobId);
    if (job) router.push('/smart-match/deck');
  };

  const runScenario = (id: string) => {
    const job = runDemoScenario(id);
    if (job) router.push('/smart-match/deck');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 40 }}>
        <PageHeader
          title="SiamEZ Smart Match"
          subtitle="AI recruitment for Thailand’s freelancer marketplace. Describe the job, set what actually matters, then review ranked professionals."
          badge="DEMO MODE"
          onBack={() => router.back()}
          primaryCta={{
            label: role === 'corporate' ? 'Smart Hiring' : role === 'freelancer' ? 'Job matches' : 'Find matches',
            onPress: () =>
              router.push(role === 'freelancer' ? '/smart-match/freelancer-deck' : '/smart-match/create'),
          }}
          secondaryCta={{
            label: role === 'corporate' ? 'Hiring profiles' : role === 'freelancer' ? 'Work preferences' : 'My preferences',
            onPress: () =>
              router.push(
                role === 'corporate'
                  ? '/smart-match/corporate'
                  : role === 'freelancer'
                    ? '/smart-match/work-preferences'
                    : '/smart-match/preferences',
              ),
          }}
        />

        <DemoModeBanner onReset={resetDemo} />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {ROLES.map((item) => {
            const active = role === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => switchRole(item.id)}
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
                <Text style={{ color: active ? '#fff' : colors.foreground, fontWeight: '800', fontSize: 12 }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 18 }}>Demo scenarios</Text>
          <Text style={{ color: colors.muted, marginTop: 6, marginBottom: 12 }}>
            Each scenario loads real preference profiles so you can see the AI change rankings.
          </Text>
          <View style={{ gap: 10 }}>
            {DEMO_SCENARIOS.map((scenario) => (
              <Button
                key={scenario.id}
                label={`${scenario.title} — ${scenario.blurb}`}
                variant="secondary"
                onPress={() => runScenario(scenario.id)}
              />
            ))}
          </View>
        </Card>

        {role === 'client' ? (
          <>
            <Card>
              <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '800' }}>
                Tell us who you’re looking for
              </Text>
              <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
                Set must-haves, preferred traits, and flexibility. The simulated AI ranks professionals against your
                criteria — never appearance, age, or protected characteristics.
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
        ) : null}

        {role === 'corporate' ? (
          <Card>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '800' }}>Smart Hiring</Text>
            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
              {companyName}: pick a reusable hiring profile, add job requirements, override company preferences, then
              shortlist candidates into a hiring pipeline.
            </Text>
            <View style={{ marginTop: 16, gap: 10 }}>
              <Button label="Company hiring profiles" onPress={() => router.push('/smart-match/corporate')} />
              <Button label="Create a corporate job" variant="secondary" onPress={() => router.push('/smart-match/create?mode=corporate')} />
              <Button label="Hiring pipeline" variant="secondary" onPress={() => router.push('/smart-match/pipeline')} />
            </View>
          </Card>
        ) : null}

        {role === 'freelancer' ? (
          <Card>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '800' }}>Smart job matches</Text>
            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
              Set work preferences, then swipe ranked jobs. Matches are two-sided: the job must fit you, and you must fit the client.
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
            <View style={{ marginTop: 16, gap: 10 }}>
              <Button label="My work preferences" variant="secondary" onPress={() => router.push('/smart-match/work-preferences')} />
              <Button label="Open job deck" onPress={() => router.push('/smart-match/freelancer-deck')} gradient />
            </View>
          </Card>
        ) : null}

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
