import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Section } from '../../components/ui/Section';
import { serviceCatalog } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
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
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <Header title={t('home.title')} subtitle={t('home.subtitle')} gradient />

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
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {t('home.preferences')}
              </Text>
              {!preferencesExpanded ? (
                <Text className="mt-1 text-sm" numberOfLines={2} style={{ color: colors.mutedText }}>
                  {t('home.preferencesSubtitle')}
                </Text>
              ) : null}
            </View>
            <Ionicons name={preferencesExpanded ? 'chevron-up' : 'chevron-down'} size={22} color={colors.mutedText} />
          </Pressable>
          {preferencesExpanded ? (
            <View className="mt-3 gap-0">
              <Text className="text-sm font-medium" style={{ color: colors.mutedText }}>
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
                    <Text style={{ color: themeMode === mode ? '#ffffff' : colors.text }}>{t(`settings.${mode}`)}</Text>
                  </Pressable>
                ))}
              </View>
              <Text className="mt-4 text-sm font-medium" style={{ color: colors.mutedText }}>
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
                    <Text style={{ color: language === lang ? '#ffffff' : colors.text }}>
                      {lang === 'en' ? t('settings.english') : t('settings.thai')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </Card>

        <Card>
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>{t('home.findService')}</Text>
          <Input placeholder={t('home.searchServices')} value={query} onChangeText={setQuery} className="mt-3" />
          <View className="mt-4">
            <Button label={t('home.bookService')} onPress={() => router.push('/(tabs)/book')} />
          </View>
        </Card>

        <Section title={t('home.popularServices')} subtitle={t('home.popularServicesSubtitle')}>
          {featuredServices.map((service) => (
            <Card key={service.slug}>
              <Text className="text-2xl">{service.icon}</Text>
              <Text className="mt-2 text-base font-semibold text-slate-900">{service.title}</Text>
              <Text className="mt-1 text-slate-500">{service.shortDescription}</Text>
              <View className="mt-4">
                <Button label={t('home.viewService')} variant="secondary" onPress={() => router.push(`/services/${service.slug}`)} />
              </View>
            </Card>
          ))}
          <Button label={t('home.viewAllServices')} variant="secondary" onPress={() => router.push('/(tabs)/services')} />
        </Section>

        <Section title="Trusted by clients" subtitle="Quality and reliability across every service touchpoint.">
          <Card className="flex-row justify-between">
            <View>
              <Text className="text-3xl font-bold text-brand-600">1000+</Text>
              <Text className="text-slate-500">Clients</Text>
            </View>
            <View>
              <Text className="text-3xl font-bold text-brand-600">10+</Text>
              <Text className="text-slate-500">Years</Text>
            </View>
            <View>
              <Text className="text-3xl font-bold text-brand-600">100%</Text>
              <Text className="text-slate-500">Care</Text>
            </View>
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
