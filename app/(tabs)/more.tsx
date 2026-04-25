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
  path: '/(tabs)/dashboard' | '/(tabs)/documents' | '/(tabs)/services' | '/(tabs)/contact' | '/(tabs)/profile';
};

const MORE_LINKS: MoreLink[] = [
  {
    label: 'Dashboard',
    subtitle: 'Overview of your account',
    icon: 'speedometer-outline',
    path: '/(tabs)/dashboard',
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
