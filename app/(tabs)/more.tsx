import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { BrandHeader } from '../../components/ui/BrandHeader';
import { Card } from '../../components/ui/Card';
import { MenuRow } from '../../components/ui/MenuRow';
import { publicFreelancerDirectoryHref } from '../../features/freelancer/public-directory-route';
import { useSoftLaunch } from '../../hooks/use-soft-launch';
import { isCorporateRole } from '../../lib/auth/role';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

type MoreLink = {
  title: string;
  subtitle: string;
  icon: Parameters<typeof MenuRow>[0]['icon'];
  path:
    | '/(tabs)/concierge'
    | '/(tabs)/sales'
    | '/(tabs)/real-estate'
    | '/(tabs)/search'
    | '/(tabs)/book'
    | '/(tabs)/contact'
    | '/(tabs)/documents'
    | '/(tabs)/dashboard'
    | '/(tabs)/profile'
    | '/freelancers'
    | '/smart-match';
  softLaunch?: boolean;
  memberOnly?: boolean;
};

const MORE_LINKS: MoreLink[] = [
  {
    title: 'Ask SiamEZ',
    subtitle: 'Get help finding the right service',
    icon: 'chatbubbles-outline',
    path: '/(tabs)/concierge',
  },
  {
    title: 'Book a Service',
    subtitle: 'Start a booking in a few taps',
    icon: 'calendar-outline',
    path: '/(tabs)/book',
  },
  {
    title: 'Vehicles',
    subtitle: 'Cars and motorcycles for sale',
    icon: 'car-outline',
    path: '/(tabs)/sales',
  },
  {
    title: 'Property',
    subtitle: 'Homes, condos, and rentals',
    icon: 'home-outline',
    path: '/(tabs)/real-estate',
  },
  {
    title: 'Freelancers',
    subtitle: 'Browse public freelancer profiles',
    icon: 'people-outline',
    path: '/freelancers',
  },
  {
    title: 'Search',
    subtitle: 'Services, vehicles, and property',
    icon: 'search-outline',
    path: '/(tabs)/search',
  },
  {
    title: 'Documents',
    subtitle: 'Upload and manage case files',
    icon: 'document-text-outline',
    path: '/(tabs)/documents',
    memberOnly: true,
  },
  {
    title: 'Dashboard',
    subtitle: 'Overview of your account',
    icon: 'speedometer-outline',
    path: '/(tabs)/dashboard',
    memberOnly: true,
  },
  {
    title: 'SiamEZ Smart Match',
    subtitle: 'AI job ↔ freelancer matching',
    icon: 'sparkles-outline',
    path: '/smart-match',
    softLaunch: false,
  },
  {
    title: 'Contact',
    subtitle: 'Reach our support team',
    icon: 'mail-outline',
    path: '/(tabs)/contact',
  },
  {
    title: 'Profile',
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
  const userRole = useAuthStore((s) => s.userRole);
  const user = useAuthStore((s) => s.user);
  const isMember = Boolean(accessToken) && !isGuest;
  const freelancersHref = publicFreelancerDirectoryHref({
    softLaunchEnabled: softLaunch.enabled,
    showFreelancers: softLaunch.showFreelancers,
    isFreelancer: userRole === 'freelancer' || user?.role === 'freelancer',
    isCorporate: isCorporateRole(userRole, user?.role),
  });

  const links = MORE_LINKS.filter((item) => {
    if (item.memberOnly && !isMember) return false;
    if (softLaunch.enabled && item.softLaunch === false) return false;
    if (item.path === '/freelancers' && !softLaunch.showFreelancers) return false;
    if (item.path === '/smart-match' && !softLaunch.showSmartMatch) return false;
    return true;
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.screenPaddingX,
          gap: spacing.sectionGap,
          paddingBottom: 32 + VOICE_FAB_SCROLL_EXTRA,
        }}
      >
        <BrandHeader
          title={t('tabs.more')}
          subtitle={
            softLaunch.enabled
              ? 'Services, vehicles, property, and Ask SiamEZ.'
              : 'Everything else in one place.'
          }
        />

        <Card>
          <View>
            {links.map((item, index) => (
              <View key={item.path}>
                {index > 0 ? (
                  <View style={{ height: 1, backgroundColor: colors.border }} />
                ) : null}
                <MenuRow
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={() =>
                    router.push(item.path === '/freelancers' ? freelancersHref : item.path)
                  }
                />
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
