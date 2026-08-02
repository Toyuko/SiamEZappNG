import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type MoreLink = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  path:
    | '/(tabs)/dashboard'
    | '/(tabs)/documents'
    | '/(tabs)/goals'
    | '/(tabs)/life-events'
    | '/(tabs)/saved'
    | '/(tabs)/concierge'
    | '/(tabs)/workflows'
    | '/(tabs)/search'
    | '/(tabs)/seller'
    | '/(tabs)/services'
    | '/(tabs)/sales'
    | '/(tabs)/real-estate'
    | '/(tabs)/contact'
    | '/(tabs)/profile'
    | '/freelancers'
    | '/freelancers/settings';
};

const MORE_LINKS: MoreLink[] = [
  {
    label: 'Dashboard',
    subtitle: 'Overview of your account',
    icon: 'speedometer-outline',
    path: '/(tabs)/dashboard',
  },
  {
    label: 'AI Concierge',
    subtitle: 'Journey-aware Platform Concierge',
    icon: 'chatbubbles-outline',
    path: '/(tabs)/concierge',
  },
  {
    label: 'Search',
    subtitle: 'Unified services, vehicles, and property search',
    icon: 'search-outline',
    path: '/(tabs)/search',
  },
  {
    label: 'Goals',
    subtitle: 'Track goals synced with the Platform',
    icon: 'flag-outline',
    path: '/(tabs)/goals',
  },
  {
    label: 'Life Events',
    subtitle: 'Journeys, checklists, and progress',
    icon: 'trail-sign-outline',
    path: '/(tabs)/life-events',
  },
  {
    label: 'Workflows',
    subtitle: 'Inspection, viewing, and template runs',
    icon: 'git-network-outline',
    path: '/(tabs)/workflows',
  },
  {
    label: 'Saved & Compare',
    subtitle: 'Buyer hub + saved searches',
    icon: 'bookmark-outline',
    path: '/(tabs)/saved',
  },
  {
    label: 'Seller hub',
    subtitle: 'Views, enquiries, listing performance',
    icon: 'storefront-outline',
    path: '/(tabs)/seller',
  },
  {
    label: 'Documents',
    subtitle: 'Upload and manage files',
    icon: 'document-text-outline',
    path: '/(tabs)/documents',
  },
  {
    label: 'Services',
    subtitle: 'Browse available services',
    icon: 'grid-outline',
    path: '/(tabs)/services',
  },
  {
    label: 'Freelancers',
    subtitle: 'Browse public freelancer profiles',
    icon: 'people-outline',
    path: '/freelancers',
  },
  {
    label: 'Sales Inventory',
    subtitle: 'Browse, add, and manage listings',
    icon: 'car-sport-outline',
    path: '/(tabs)/sales',
  },
  {
    label: 'Real Estate',
    subtitle: 'Browse homes, condos, and land',
    icon: 'home-outline',
    path: '/(tabs)/real-estate',
  },
  {
    label: 'Contact',
    subtitle: 'Reach our support team',
    icon: 'mail-outline',
    path: '/(tabs)/contact',
  },
  {
    label: 'Profile',
    subtitle: 'Preferences and account settings',
    icon: 'person-outline',
    path: '/(tabs)/profile',
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader title={t('tabs.more')} subtitle="Everything else in one place." />

        <Card>
          <View className="gap-2">
            {MORE_LINKS.map((item) => (
              <Pressable
                key={item.path}
                onPress={() => router.push(item.path)}
                className="flex-row items-center gap-3 rounded-xl px-3 py-3"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.75 : 1,
                  backgroundColor: colors.background,
                })}
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                >
                  <Ionicons name={item.icon} size={18} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    {item.label}
                  </Text>
                  <Text className="mt-0.5 text-xs leading-4" style={{ color: colors.muted }}>
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
