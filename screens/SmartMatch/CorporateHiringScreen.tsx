import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { PreferenceBuilder } from '../../components/smart-match/PreferenceBuilder';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { CATEGORY_LABELS } from '../../features/matching/matching.constants';
import { defaultClientPreferenceItems, pref } from '../../features/matching/matching.preferences';
import { useMatchingStore } from '../../features/matching/matching.store';
import type { CorporateHiringProfile, ServiceCategoryId } from '../../features/matching/matching.types';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function CorporateHiringScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const account = useMatchingStore((s) => s.corporateAccount);
  const chooseHiringProfile = useMatchingStore((s) => s.chooseHiringProfile);
  const saveHiringProfile = useMatchingStore((s) => s.saveHiringProfile);
  const switchRole = useMatchingStore((s) => s.switchRole);
  const active = account.profiles.find((item) => item.id === account.activeProfileId) ?? account.profiles[0];
  const [draft, setDraft] = useState<CorporateHiringProfile | null>(active ?? null);

  const current = draft ?? active;

  const companyMeta = useMemo(
    () => [
      ['Company', account.companyName],
      ['Industry', account.industry],
      ['Size', account.companySize],
      ['Location', account.location],
      ['Hiring manager', account.hiringManager],
      ['Verification', account.verified ? 'Verified company' : 'Unverified'],
    ],
    [account],
  );

  const save = () => {
    if (!current) return;
    switchRole('corporate');
    saveHiringProfile(current);
    router.back();
  };

  const addProfile = () => {
    const next: CorporateHiringProfile = {
      id: `hp-${Date.now()}`,
      name: 'New hiring profile',
      category: 'vehicle_registration',
      items: [
        ...defaultClientPreferenceItems(account.location),
        pref('corp-xp', 'corporate_experience', true, 'preferred', 'flexible', 'corporate_profile', 'Corporate experience'),
      ],
    };
    setDraft(next);
    chooseHiringProfile(next.id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 48 }}>
        <PageHeader
          title="Company hiring preferences"
          subtitle="Reusable Freelancer Hiring Profiles. Job requirements stay separate from company preferences."
          onBack={() => router.back()}
        />
        <DemoModeBanner />

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 18 }}>{account.companyName}</Text>
          {companyMeta.map(([label, value]) => (
            <Text key={label} style={{ color: colors.muted, marginTop: 6 }}>
              {label}: {value}
            </Text>
          ))}
          <Text style={{ color: colors.muted, marginTop: 6 }}>Departments: {account.departments.join(', ')}</Text>
        </Card>

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800', marginBottom: 12 }}>My hiring profiles</Text>
          <View style={{ gap: 8 }}>
            {account.profiles.map((profile) => {
              const selected = current?.id === profile.id;
              return (
                <Pressable
                  key={profile.id}
                  onPress={() => {
                    chooseHiringProfile(profile.id);
                    setDraft(profile);
                  }}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: selected ? siam.yellow.DEFAULT : colors.border,
                    backgroundColor: selected ? 'rgba(44,84,198,0.08)' : colors.background,
                  }}
                >
                  <Text style={{ color: colors.foreground, fontWeight: '800' }}>{profile.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{CATEGORY_LABELS[profile.category as ServiceCategoryId]}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ marginTop: 12 }}>
            <Button label="Add hiring profile" variant="secondary" onPress={addProfile} />
          </View>
        </Card>

        {current ? (
          <Card>
            <Input label="Profile name" value={current.name} onChangeText={(name) => setDraft({ ...current, name })} />
            <View style={{ height: 12 }} />
            <Text style={{ color: colors.muted, marginBottom: 8 }}>
              Service category: {CATEGORY_LABELS[current.category]}
            </Text>
            <PreferenceBuilder
              tone="corporate"
              title="Candidate preferences"
              items={current.items}
              onChange={(items) => setDraft({ ...current, items })}
            />
          </Card>
        ) : null}

        <Button label="Save preference profile" onPress={save} gradient />
        <Button
          label="Create a job with this profile"
          variant="secondary"
          onPress={() => {
            if (current) {
              switchRole('corporate');
              saveHiringProfile(current);
            }
            router.push('/smart-match/create?mode=corporate');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
