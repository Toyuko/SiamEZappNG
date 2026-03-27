import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import { TrustStats } from '../../components/ui/TrustStats';
import { serviceCatalog } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme, type ThemeMode } from '../../lib/theme/theme';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { useThemeStore } from '../../lib/theme/useThemeStore';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [preferencesExpanded, setPreferencesExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const featuredServices = useMemo(
    () => serviceCatalog.filter((service) => service.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6),
    [query],
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader
          badge={t('home.badge')}
          title={t('home.title')}
          subtitle={t('home.subtitle')}
          primaryCta={{ label: t('cta.getStarted'), onPress: () => router.push('/(auth)/signup') }}
          secondaryCta={{ label: t('cta.learnMore'), onPress: () => router.push('/(tabs)/services') }}
        />

        <TrustStats />

        <Section title={t('trust.whatClientsSay')} subtitle={t('trust.testimonialSubtitle')}>
          <Card>
            <Text className="text-base leading-6 italic" style={{ color: colors.muted }}>
              &ldquo;{t('trust.testimonialQuote')}&rdquo;
            </Text>
            <Text className="mt-3 text-sm font-semibold" style={{ color: colors.foreground }}>
              {t('trust.testimonialAttribution')}
            </Text>
          </Card>
        </Section>

        <Card>
          <Pressable
            onPress={() => setPreferencesExpanded((open) => !open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: preferencesExpanded }}
            accessibilityLabel={t('home.preferences')}
            className="flex-row items-center justify-between gap-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                {t('home.preferences')}
              </Text>
              {!preferencesExpanded ? (
                <Text className="mt-1 text-sm leading-5" numberOfLines={2} style={{ color: colors.muted }}>
                  {t('home.preferencesSubtitle')}
                </Text>
              ) : null}
            </View>
            <Ionicons name={preferencesExpanded ? 'chevron-up' : 'chevron-down'} size={22} color={colors.muted} />
          </Pressable>
          {preferencesExpanded ? (
            <View className="mt-3 gap-0">
              <Text className="text-sm font-medium" style={{ color: colors.muted }}>
                {t('settings.theme')}
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                  <Pressable
                    key={mode}
                    className="rounded-full px-4 py-2"
                    style={{
                      backgroundColor: themeMode === mode ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => setTheme(mode)}
                  >
                    <Text style={{ color: themeMode === mode ? '#ffffff' : colors.foreground }}>{t(`settings.${mode}`)}</Text>
                  </Pressable>
                ))}
              </View>
              <Text className="mt-4 text-sm font-medium" style={{ color: colors.muted }}>
                {t('settings.language')}
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {(['en', 'th'] as const).map((lang) => (
                  <Pressable
                    key={lang}
                    className="rounded-full px-4 py-2"
                    style={{
                      backgroundColor: language === lang ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => setLanguage(lang)}
                  >
                    <Text style={{ color: language === lang ? '#ffffff' : colors.foreground }}>
                      {lang === 'en' ? t('settings.english') : t('settings.thai')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </Card>

        <Card>
          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
            {t('home.findService')}
          </Text>
          <Text className="mt-1 text-sm leading-5" style={{ color: colors.muted }}>
            {t('home.searchServices')}
          </Text>
          <Input placeholder={t('home.searchServices')} value={query} onChangeText={setQuery} className="mt-3" />
          <View className="mt-4">
            <Button label={t('cta.bookNow')} onPress={() => router.push('/(tabs)/book')} />
          </View>
        </Card>

        <Section title={t('home.popularServices')} subtitle={t('home.popularServicesSubtitle')}>
          {featuredServices.map((service) => (
            <Card key={service.slug}>
              <Text className="text-2xl">{service.icon}</Text>
              <Text className="mt-2 text-base font-bold" style={{ color: colors.foreground }}>
                {service.title}
              </Text>
              <Text className="mt-1 text-sm leading-5" style={{ color: colors.muted }}>
                {service.shortDescription}
              </Text>
              <View className="mt-4 gap-3">
                <Button
                  label={t('cta.bookNow')}
                  onPress={() =>
                    router.push({ pathname: '/(tabs)/book', params: { serviceSlug: service.slug } })
                  }
                />
                <Button
                  label={t('home.details')}
                  variant="secondary"
                  onPress={() => router.push(`/services/${service.slug}`)}
                />
              </View>
            </Card>
          ))}
          <Button label={t('home.viewAllServices')} variant="secondary" onPress={() => router.push('/(tabs)/services')} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
