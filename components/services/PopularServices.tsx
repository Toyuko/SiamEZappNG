import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getServiceTitle } from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

type PopularServicesProps = {
  services: ServiceItem[];
};

export function PopularServices({ services }: PopularServicesProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);

  if (services.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: spacing.stackSm }}>
      <View>
        <Text className="text-base font-bold" style={{ color: colors.foreground }}>
          {t('home.popularServices')}
        </Text>
        <Text className="mt-1 text-sm leading-5" style={{ color: colors.muted }}>
          {t('home.popularServicesSubtitle')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.stackSm, paddingVertical: 2 }}
      >
        {services.map((service) => {
          const title = getServiceTitle(service, language);
          const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
          return (
            <Pressable
              key={service.slug}
              onPress={() => router.push(`/services/${service.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={title}
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                width: 112,
                alignItems: 'center',
                padding: spacing.stackSm,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              })}
            >
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: tint }}
              >
                <Ionicons name={service.icon} size={28} color={colors.primary} accessibilityIgnoresInvertColors />
              </View>
              <Text
                className="mt-2 text-center text-xs font-semibold leading-4"
                style={{ color: colors.foreground }}
                numberOfLines={2}
              >
                {title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
