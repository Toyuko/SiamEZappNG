import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CategoryPicker } from '../../components/smart-match/CategoryPicker';
import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { PreferenceBuilder } from '../../components/smart-match/PreferenceBuilder';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { defaultClientPreferenceItems } from '../../features/matching/matching.preferences';
import { useMatchingStore } from '../../features/matching/matching.store';
import type { ServiceCategoryId } from '../../features/matching/matching.types';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function ClientPreferencesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const stored = useMatchingStore((s) => s.clientProfile);
  const updateClientProfile = useMatchingStore((s) => s.updateClientProfile);
  const hints = stored.learnedHints.filter((hint) => !hint.confirmed);
  const acceptLearnedHint = useMatchingStore((s) => s.acceptLearnedHint);
  const [profile, setProfile] = useState(() => ({
    ...stored,
    items: stored.items.length ? stored.items : defaultClientPreferenceItems(),
  }));

  const toggleCategory = (id: ServiceCategoryId) => {
    const selected = profile.serviceCategories.includes(id)
      ? profile.serviceCategories.filter((item) => item !== id)
      : [...profile.serviceCategories, id];
    setProfile({ ...profile, serviceCategories: selected });
  };

  const save = () => {
    updateClientProfile(profile);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 48 }}>
        <PageHeader
          title="What kind of freelancer are you looking for?"
          subtitle="Tell us who you're looking for. The AI ranks professionals against YOUR hiring criteria — not a generic swipe feed."
          onBack={() => router.back()}
        />
        <DemoModeBanner />

        {hints.map((hint) => (
          <Card key={hint.id}>
            <Text style={{ color: colors.foreground, fontWeight: '800' }}>{hint.text}</Text>
            <Text style={{ color: colors.muted, marginTop: 6, fontSize: 13 }}>{hint.evidence}</Text>
            <View style={{ marginTop: 12 }}>
              <Button label="Use this preference" onPress={() => acceptLearnedHint(hint.id)} />
            </View>
          </Card>
        ))}

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800', marginBottom: 12 }}>Service preferences</Text>
          <CategoryPicker value={null} onChange={toggleCategory} values={profile.serviceCategories} onToggle={toggleCategory} />
        </Card>

        <PreferenceBuilder
          title="Freelancer characteristics"
          items={profile.items}
          onChange={(items) => setProfile({ ...profile, items })}
        />

        <Button label="Save preference profile" onPress={save} gradient />
      </ScrollView>
    </SafeAreaView>
  );
}
