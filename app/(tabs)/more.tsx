import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { useSoftLaunch } from '../../hooks/use-soft-launch';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

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
    | '/(tabs)/book'
    | '/(tabs)/contact'
    | '/(tabs)/profile'
    | '/freelancers'
    | '/freelancers/settings';
  /** Soft-launch visibility — default true when omitted. */
  softLaunch?: boolean;
  guestOnly?: boolean;
  memberOnly?: boolean;
};

const MORE_LINKS: MoreLink[] = [
  {
    label: 'Ask SiamEZ',
    subtitle: 'AI Concierge for services, vehicles, and property',
    icon: 'chatbubbles-outline',
    path: '/(tabs)/concierge',
  },
  {
    label: 'Dashboard',
    subtitle: 'Overview of your account',
    icon: 'speedometer-outline',
    path: '/(tabs)/dashboard',
    memberOnly: true,
  },
  {
    label: 'Search',
    subtitle: 'Services, vehicles, and property',
    icon: 'search-outline',
    path: '/(tabs)/search',
  },
  {
    label: 'Book a service',
    subtitle: 'Start a booking wizard',
    icon: 'calendar-outline',
    path: '/(tabs)/book',
  },
  {
    label: 'Seller listings',
    subtitle: 'Manage vehicle and property listings',
    icon: 'storefront-outline',
    path: '/(tabs)/seller',
    memberOnly: true,
  },
  {
    label: 'Documents',
    subtitle: 'Upload and manage files',
    icon: 'document-text-outline',
    path: '/(tabs)/documents',
    memberOnly: true,
  },
  {
    label: 'Goals',
    subtitle: 'Track goals synced with the Platform',
    icon: 'flag-outline',
    path: '/(tabs)/goals',
    memberOnly: true,
    softLaunch: false,
  },
  {
    label: 'Life Events',
    subtitle: 'Journeys, checklists, and progress',
    icon: 'trail-sign-outline',
    path: '/(tabs)/life-events',
    memberOnly: true,
    softLaunch: false,
  },
  {
    label: 'Workflows',
    subtitle: 'Inspection, viewing, and template runs',
    icon: 'git-network-outline',
    path: '/(tabs)/workflows',
    memberOnly: true,
    softLaunch: false,
  },
  {
    label: 'Saved & Compare',
    subtitle: 'Buyer hub + saved searches',
    icon: 'bookmark-outline',
    path: '/(tabs)/saved',
    memberOnly: true,
    softLaunch: false,
  },
  {
    label: 'Freelancers',
    subtitle: 'Browse public freelancer profiles',
    icon: 'people-outline',
    path: '/freelancers',
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
    memberOnly: true,
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const softLaunch = useSoftLaunch();
  const isGuest = useAuthStore((s) => s.isGuest);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isMember = Boolean(accessToken) && !isGuest;

  const links = MORE_LINKS.filter((item) => {
    if (item.memberOnly && !isMember) return false;
    if (item.guestOnly && !isGuest) return false;
    if (softLaunch.enabled && item.softLaunch === false) return false;
    if (softLaunch.enabled && item.path === '/(tabs)/seller' && !softLaunch.showSellerListings) {
      return false;
    }
    if (item.path === '/freelancers' && !softLaunch.showFreelancers) {
      return false;
    }
    return true;
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader
          title={t('tabs.more')}
          subtitle={
            softLaunch.enabled
              ? 'Services, vehicles, property, and Ask SiamEZ.'
              : 'Everything else in one place.'
          }
        />

        <Card>
          <View className="gap-2">
            {links.map((item) => (
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
