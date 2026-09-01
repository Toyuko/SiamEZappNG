import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CategoryPicker } from '../../components/smart-match/CategoryPicker';
import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { SelectField } from '../../components/ui/SelectField';
import { EXPERIENCE_LABELS, URGENCY_LABELS } from '../../features/matching/matching.constants';
import { draftFromParsed, emptyJobDraft } from '../../features/matching/matching.service';
import { useMatchingStore } from '../../features/matching/matching.store';
import type { ExperienceLevel, JobDraft, JobUrgency, LocationMode, ServiceCategoryId } from '../../features/matching/matching.types';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const STEPS = ['Category', 'Where', 'When', 'Budget', 'Experience', 'Details', 'Match'];

export function CreateJobScreen() {
  const router = useRouter();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const { colors } = useTheme();
  const createJobFromDraft = useMatchingStore((s) => s.createJobFromDraft);
  const parseNaturalLanguage = useMatchingStore((s) => s.parseNaturalLanguage);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<JobDraft>(() => {
    const base = emptyJobDraft();
    if (categoryParam) {
      return { ...base, category: categoryParam as ServiceCategoryId };
    }
    return base;
  });
  const [nl, setNl] = useState('');
  const [understood, setUnderstood] = useState(false);

  const patch = (partial: Partial<JobDraft>) => setDraft((prev) => ({ ...prev, ...partial }));

  const runParse = () => {
    const parsed = parseNaturalLanguage(nl);
    setDraft(draftFromParsed(parsed));
    setUnderstood(true);
    setStep(parsed.category ? 7 : 1);
  };

  const canNext = useMemo(() => {
    if (step === 1) return Boolean(draft.category);
    if (step === 2) return Boolean(draft.location.trim());
    return true;
  }, [draft.category, draft.location, step]);

  const findMatches = () => {
    createJobFromDraft(draft);
    router.push('/smart-match/deck');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <PageHeader
          title="Create a job"
          subtitle="Tell SiamEZ what you need. Simulated AI extracts the brief — you can edit everything before matching."
          onBack={() => router.back()}
        />
        <DemoModeBanner />

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 16 }}>Describe it in your own words</Text>
          <Text style={{ color: colors.muted, marginTop: 6, marginBottom: 10 }}>
            Example: “I need someone to fix my Vespa GTS 300 in Bangkok tomorrow. I can pay around 15,000 baht.”
          </Text>
          <Input
            value={nl}
            onChangeText={setNl}
            placeholder="Type your request..."
            multiline
            numberOfLines={4}
            style={{ minHeight: 96, textAlignVertical: 'top' }}
          />
          <View style={{ marginTop: 12 }}>
            <Button label="AI, understand this request" onPress={runParse} disabled={!nl.trim()} variant="accent" gradient />
          </View>
          {understood ? (
            <View style={{ marginTop: 12, gap: 4 }}>
              <Text style={{ color: colors.success, fontWeight: '800' }}>AI understood your request</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Edit any field below before generating matches.</Text>
            </View>
          ) : null}
        </Card>

        <View style={{ flexDirection: 'row', gap: 4 }}>
          {STEPS.map((label, index) => {
            const n = index + 1;
            const active = n === step;
            return (
              <Pressable
                key={label}
                onPress={() => setStep(n)}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 99,
                  backgroundColor: active || n < step ? colors.primary : colors.border,
                }}
                accessibilityLabel={`Step ${n}: ${label}`}
              />
            );
          })}
        </View>
        <Text style={{ color: colors.muted, fontWeight: '700' }}>
          Step {step} · {STEPS[step - 1]}
        </Text>

        {step === 1 ? (
          <Card>
            <Text style={{ color: colors.foreground, fontWeight: '800', marginBottom: 12 }}>What do you need?</Text>
            <CategoryPicker value={draft.category} onChange={(category) => patch({ category })} />
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <Input label="City" value={draft.location} onChangeText={(location) => patch({ location })} placeholder="Bangkok" />
            <View style={{ height: 12 }} />
            <Input label="Province / area" value={draft.province} onChangeText={(province) => patch({ province })} placeholder="Bangkok" />
            <View style={{ height: 12 }} />
            <SelectField
              label="Service area"
              placeholder="On-site"
              value={draft.locationMode}
              onChange={(locationMode) => patch({ locationMode: locationMode as LocationMode, remoteOk: locationMode === 'remote' })}
              options={[
                { value: 'onsite', label: 'On-site / specific area' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
              ]}
            />
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <SelectField
              label="When?"
              placeholder="ASAP"
              value={draft.urgency}
              onChange={(urgency) => patch({ urgency: urgency as JobUrgency })}
              options={Object.entries(URGENCY_LABELS).map(([value, label]) => ({ value, label }))}
            />
            {draft.urgency === 'specific_date' ? (
              <View style={{ marginTop: 12 }}>
                <Input label="Date" value={draft.specificDate} onChangeText={(specificDate) => patch({ specificDate })} placeholder="2026-09-12" />
              </View>
            ) : null}
          </Card>
        ) : null}

        {step === 4 ? (
          <Card>
            <Input
              label="Budget min (฿)"
              keyboardType="numeric"
              value={draft.budgetMin}
              onChangeText={(budgetMin) => patch({ budgetMin })}
              placeholder="15000"
            />
            <View style={{ height: 12 }} />
            <Input
              label="Budget max (฿)"
              keyboardType="numeric"
              value={draft.budgetMax}
              onChangeText={(budgetMax) => patch({ budgetMax })}
              placeholder="25000"
            />
          </Card>
        ) : null}

        {step === 5 ? (
          <Card>
            <SelectField
              label="Experience required"
              placeholder="Any"
              value={draft.experienceRequired}
              onChange={(experienceRequired) => patch({ experienceRequired: experienceRequired as ExperienceLevel })}
              options={Object.entries(EXPERIENCE_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </Card>
        ) : null}

        {step === 6 ? (
          <Card>
            <Input
              label="Additional requirements"
              value={draft.description}
              onChangeText={(description) => patch({ description })}
              placeholder="Need someone who can service Vespa and European motorcycles."
              multiline
              numberOfLines={5}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
            <View style={{ height: 12 }} />
            <Input
              label="Skills (comma separated)"
              value={draft.requiredSkills.join(', ')}
              onChangeText={(value) =>
                patch({
                  requiredSkills: value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Vespa, Motorcycle repair"
            />
          </Card>
        ) : null}

        {step === 7 ? (
          <Card>
            <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 18 }}>Ready to match</Text>
            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
              {draft.category ?? 'Category'} · {draft.location || 'Location'} · {URGENCY_LABELS[draft.urgency]}
              {draft.budgetMax ? ` · ฿${draft.budgetMax}` : ''}
            </Text>
            <View style={{ marginTop: 16 }}>
              <Button label="Find My Best Matches" onPress={findMatches} disabled={!draft.category} gradient />
            </View>
          </Card>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {step > 1 ? (
            <View style={{ flex: 1 }}>
              <Button label="Back" variant="secondary" onPress={() => setStep((n) => n - 1)} />
            </View>
          ) : null}
          {step < 7 ? (
            <View style={{ flex: 1 }}>
              <Button label="Next" onPress={() => setStep((n) => n + 1)} disabled={!canNext} />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
