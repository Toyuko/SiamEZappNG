import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CategoryPicker } from '../../components/smart-match/CategoryPicker';
import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { SelectField } from '../../components/ui/SelectField';
import { EMPLOYMENT_LABELS } from '../../features/matching/matching.constants';
import { emptyFreelancerProfile } from '../../features/matching/matching.preferences';
import { useMatchingStore } from '../../features/matching/matching.store';
import type { EmploymentType, PreferredClientKind, ServiceCategoryId } from '../../features/matching/matching.types';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function WorkPreferencesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const viewerFreelancerId = useMatchingStore((s) => s.viewerFreelancerId);
  const stored = useMatchingStore((s) => s.freelancerProfiles[s.viewerFreelancerId]);
  const updateWorkPreferences = useMatchingStore((s) => s.updateWorkPreferences);
  const [profile, setProfile] = useState(() => stored ?? emptyFreelancerProfile(viewerFreelancerId));

  const toggleService = (id: ServiceCategoryId) => {
    const services = profile.services.includes(id) ? profile.services.filter((item) => item !== id) : [...profile.services, id];
    setProfile({ ...profile, services });
  };

  const toggleEmployment = (type: EmploymentType) => {
    const employmentTypes = profile.employmentTypes.includes(type)
      ? profile.employmentTypes.filter((item) => item !== type)
      : [...profile.employmentTypes, type];
    setProfile({ ...profile, employmentTypes });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 48 }}>
        <PageHeader
          title="My work preferences"
          subtitle="The AI uses this to rank jobs that fit how you actually want to work."
          onBack={() => router.back()}
        />
        <DemoModeBanner />

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800', marginBottom: 12 }}>Services I offer</Text>
          <CategoryPicker value={null} onChange={toggleService} values={profile.services} onToggle={toggleService} />
        </Card>

        <Card>
          <Input
            label="Preferred locations (comma separated)"
            value={profile.preferredLocations.join(', ')}
            onChangeText={(value) =>
              setProfile({
                ...profile,
                preferredLocations: value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Bangkok, Nonthaburi, Pathum Thani"
          />
          <View style={{ height: 12 }} />
          <Input
            label="Minimum daily rate (฿)"
            keyboardType="numeric"
            value={profile.minDailyRate != null ? String(profile.minDailyRate) : ''}
            onChangeText={(value) => setProfile({ ...profile, minDailyRate: value ? Number(value) : null })}
          />
          <View style={{ height: 12 }} />
          <Input
            label="Minimum monthly rate (฿)"
            keyboardType="numeric"
            value={profile.minMonthlyRate != null ? String(profile.minMonthlyRate) : ''}
            onChangeText={(value) => setProfile({ ...profile, minMonthlyRate: value ? Number(value) : null })}
          />
          <View style={{ height: 12 }} />
          <Input
            label="Languages"
            value={profile.languages.join(', ')}
            onChangeText={(value) =>
              setProfile({
                ...profile,
                languages: value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          />
          <View style={{ height: 12 }} />
          <Input
            label="Travel radius (km)"
            keyboardType="numeric"
            value={profile.travelKm != null ? String(profile.travelKm) : ''}
            onChangeText={(value) => setProfile({ ...profile, travelKm: value ? Number(value) : null })}
          />
        </Card>

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800', marginBottom: 10 }}>Preferred employment</Text>
          {(Object.keys(EMPLOYMENT_LABELS) as EmploymentType[]).map((type) => {
            const selected = profile.employmentTypes.includes(type);
            return (
              <Button
                key={type}
                label={EMPLOYMENT_LABELS[type]}
                variant={selected ? 'primary' : 'secondary'}
                onPress={() => toggleEmployment(type)}
              />
            );
          })}
        </Card>

        <Card>
          <SelectField
            label="Preferred clients"
            placeholder="Both"
            value={profile.preferredClients}
            onChange={(value) => setProfile({ ...profile, preferredClients: value as PreferredClientKind })}
            options={[
              { value: 'individuals', label: 'Individuals' },
              { value: 'corporate', label: 'Corporate' },
              { value: 'both', label: 'Both' },
            ]}
          />
        </Card>

        <Button
          label="Save work preferences"
          gradient
          onPress={() => {
            updateWorkPreferences({ ...profile, freelancerId: viewerFreelancerId });
            router.back();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
