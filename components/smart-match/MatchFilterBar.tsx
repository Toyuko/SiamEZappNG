import { ScrollView, Text, View } from 'react-native';
import {
  BadgeCheck,
  Briefcase,
  Coins,
  Globe,
  MapPin,
  Monitor,
  Star,
} from 'lucide-react-native';

import { AVAILABILITY_LABELS, CATEGORY_LABELS, CATEGORY_ORDER, EXPERIENCE_LABELS } from '../../features/matching/matching.constants';
import type { MatchFilters } from '../../features/matching/matching.types';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { SelectField } from '../ui/SelectField';
import { Input } from '../ui/Input';

type MatchFilterBarProps = {
  filters: MatchFilters;
  onChange: (patch: Partial<MatchFilters>) => void;
};

export function MatchFilterBar({ filters, onChange }: MatchFilterBarProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: spacing.stackSm }}>
      <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 14 }}>Filter your ideal freelancer</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {[
          { icon: MapPin, label: filters.location || 'Location' },
          { icon: Briefcase, label: filters.category === 'all' ? 'Service' : CATEGORY_LABELS[filters.category] },
          { icon: Star, label: filters.minRating ? `${filters.minRating}+` : 'Rating' },
          { icon: Coins, label: filters.maxBudget ? `≤ ฿${filters.maxBudget.toLocaleString('en-US')}` : 'Budget' },
          { icon: Globe, label: filters.language || 'Language' },
          { icon: BadgeCheck, label: filters.verifiedOnly ? 'Verified' : 'Verified' },
          { icon: Monitor, label: filters.locationMode === 'any' ? 'On-site / Remote' : filters.locationMode },
        ].map((item) => (
          <View
            key={item.label}
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(44,84,198,0.10)',
            }}
          >
            <item.icon size={20} color={siam.blue.DEFAULT} />
          </View>
        ))}
      </ScrollView>
      <View style={{ gap: 10, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
        <Input
          label="Location"
          placeholder="Bangkok, Phuket..."
          value={filters.location}
          onChangeText={(location) => onChange({ location })}
        />
        <SelectField
          label="Service"
          placeholder="All services"
          value={filters.category}
          onChange={(category) => onChange({ category: category as MatchFilters['category'] })}
          options={[
            { value: 'all', label: 'All services' },
            ...CATEGORY_ORDER.map((id) => ({ value: id, label: CATEGORY_LABELS[id] })),
          ]}
        />
        <SelectField
          label="Experience"
          placeholder="Any"
          value={filters.minExperience}
          onChange={(minExperience) => onChange({ minExperience: minExperience as MatchFilters['minExperience'] })}
          options={Object.entries(EXPERIENCE_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <SelectField
          label="Availability"
          placeholder="Any"
          value={filters.availability}
          onChange={(availability) => onChange({ availability: availability as MatchFilters['availability'] })}
          options={[
            { value: 'any', label: 'Any availability' },
            ...Object.entries(AVAILABILITY_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        />
        <SelectField
          label="Verified"
          placeholder="Any"
          value={filters.verifiedOnly ? 'yes' : 'no'}
          onChange={(value) => onChange({ verifiedOnly: value === 'yes' })}
          options={[
            { value: 'no', label: 'All professionals' },
            { value: 'yes', label: 'Verified only' },
          ]}
        />
        <SelectField
          label="Work mode"
          placeholder="Any"
          value={filters.locationMode}
          onChange={(locationMode) => onChange({ locationMode: locationMode as MatchFilters['locationMode'] })}
          options={[
            { value: 'any', label: 'On-site or remote' },
            { value: 'onsite', label: 'On-site' },
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
          ]}
        />
        <Input
          label="Language"
          placeholder="English, Thai..."
          value={filters.language}
          onChangeText={(language) => onChange({ language })}
        />
        <Input
          label="Max monthly budget (฿)"
          placeholder="Optional"
          keyboardType="numeric"
          value={filters.maxBudget != null ? String(filters.maxBudget) : ''}
          onChangeText={(value) => onChange({ maxBudget: value ? Number(value.replace(/,/g, '')) : null })}
        />
        <Input
          label="Minimum rating"
          placeholder="e.g. 4.5"
          keyboardType="decimal-pad"
          value={filters.minRating != null ? String(filters.minRating) : ''}
          onChangeText={(value) => onChange({ minRating: value ? Number(value) : null })}
        />
      </View>
    </View>
  );
}
