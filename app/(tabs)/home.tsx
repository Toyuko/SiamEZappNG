import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import { TestimonialCard } from '../../components/ui/TestimonialCard';
import { TrustStats } from '../../components/ui/TrustStats';
import { serviceCatalog } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme, type ThemeMode } from '../../lib/theme/theme';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { useThemeStore } from '../../lib/theme/useThemeStore';
import { useAuthStore } from '../../store/auth-store';

const TESTIMONIAL_CAROUSEL_GAP = 8;
const TESTIMONIAL_AUTO_INTERVAL_MS = 4800;
const TESTIMONIAL_RESUME_AFTER_DRAG_MS = 3200;

type HomeTestimonial = {
  service?: string;
  quote: string;
  name: string;
  role?: string;
  stars: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const isGuest = useAuthStore((state) => state.isGuest);
  const themeMode = useThemeStore((state) => state.themeMode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [preferencesExpanded, setPreferencesExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const { width: windowWidth } = useWindowDimensions();
  const testimonialCardWidth = Math.min(windowWidth - spacing.screenPaddingX * 2 - 36, 300);
  const testimonialSlideWidth = testimonialCardWidth + TESTIMONIAL_CAROUSEL_GAP;
  const testimonialsScrollRef = useRef<ScrollView>(null);
  const testimonialIndexRef = useRef(0);
  const testimonialAutoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const testimonialResumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const testimonialProgrammaticScrollRef = useRef(false);

  const testimonials = useMemo(() => {
    const raw = t('trust.testimonials');
    if (!Array.isArray(raw)) {
      return [] as HomeTestimonial[];
    }
    return raw.filter(
      (item): item is HomeTestimonial =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as HomeTestimonial).quote === 'string' &&
        typeof (item as HomeTestimonial).name === 'string' &&
        typeof (item as HomeTestimonial).stars === 'number',
    );
  }, [language]);

  const clearTestimonialAutoPlay = useCallback(() => {
    if (testimonialAutoRef.current) {
      clearInterval(testimonialAutoRef.current);
      testimonialAutoRef.current = null;
    }
    if (testimonialResumeRef.current) {
      clearTimeout(testimonialResumeRef.current);
      testimonialResumeRef.current = null;
    }
  }, []);

  const startTestimonialAutoPlay = useCallback(() => {
    clearTestimonialAutoPlay();
    const count = testimonials.length;
    if (count <= 1) {
      return;
    }
    testimonialAutoRef.current = setInterval(() => {
      const next = (testimonialIndexRef.current + 1) % count;
      testimonialIndexRef.current = next;
      testimonialProgrammaticScrollRef.current = true;
      testimonialsScrollRef.current?.scrollTo({
        x: next * testimonialSlideWidth,
        animated: true,
      });
      setTimeout(() => {
        testimonialProgrammaticScrollRef.current = false;
      }, 500);
    }, TESTIMONIAL_AUTO_INTERVAL_MS);
  }, [clearTestimonialAutoPlay, testimonials.length, testimonialSlideWidth]);

  useEffect(() => {
    startTestimonialAutoPlay();
    return clearTestimonialAutoPlay;
  }, [startTestimonialAutoPlay, clearTestimonialAutoPlay]);

  const onTestimonialScrollBeginDrag = useCallback(() => {
    clearTestimonialAutoPlay();
  }, [clearTestimonialAutoPlay]);

  const onTestimonialMomentumScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const x = e.nativeEvent.contentOffset.x;
      testimonialIndexRef.current = Math.max(
        0,
        Math.min(testimonials.length - 1, Math.round(x / testimonialSlideWidth)),
      );
      if (testimonialProgrammaticScrollRef.current) {
        return;
      }
      if (testimonialResumeRef.current) {
        clearTimeout(testimonialResumeRef.current);
      }
      testimonialResumeRef.current = setTimeout(() => {
        testimonialResumeRef.current = null;
        startTestimonialAutoPlay();
      }, TESTIMONIAL_RESUME_AFTER_DRAG_MS);
    },
    [startTestimonialAutoPlay, testimonials.length, testimonialSlideWidth],
  );

  const featuredServices = useMemo(
    () => serviceCatalog.filter((service) => service.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6),
    [query],
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPaddingX,
          paddingTop: spacing.stackMd,
          gap: spacing.sectionGapLg,
          paddingBottom: 40,
        }}
      >
        <PageHeader
          badge={t('home.badge')}
          title={t('home.title')}
          subtitle={t('home.subtitle')}
          primaryCta={{ label: t('cta.getStarted'), onPress: () => router.push('/(auth)/signup') }}
        />

        {isGuest ? (
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
        ) : null}

        <TrustStats />

        <Section title={t('trust.whatClientsSay')} subtitle={t('trust.testimonialSubtitle')}>
          <ScrollView
            ref={testimonialsScrollRef}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={testimonialSlideWidth}
            snapToAlignment="start"
            disableIntervalMomentum
            pagingEnabled={false}
            onScrollBeginDrag={onTestimonialScrollBeginDrag}
            onMomentumScrollEnd={onTestimonialMomentumScrollEnd}
            contentContainerStyle={{
              flexDirection: 'row',
              columnGap: TESTIMONIAL_CAROUSEL_GAP,
              paddingRight: spacing.screenPaddingX,
            }}
          >
            {testimonials.map((item, index) => (
              <View key={`${item.name}-${index}`} style={{ width: testimonialCardWidth }}>
                <TestimonialCard
                  compact
                  service={item.service}
                  quote={item.quote}
                  name={item.name}
                  role={item.role}
                  ratingStars={item.stars}
                  ratingLabel={String(t('trust.ratingOutOf', { count: item.stars }))}
                />
              </View>
            ))}
          </ScrollView>
        </Section>

        <Card>
          <Text className="text-lg font-bold tracking-tight" style={{ color: colors.foreground }}>
            {t('home.findService')}
          </Text>
          <Text className="mt-1.5 text-sm leading-5" style={{ color: colors.muted }}>
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
              <Ionicons name={service.icon} size={28} color={colors.primary} accessibilityIgnoresInvertColors />
              <Text className="mt-2 text-base font-bold" style={{ color: colors.foreground }}>
                {service.title}
              </Text>
              <Text className="mt-1.5 text-sm leading-5" style={{ color: colors.muted }}>
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
          <Button variant="secondary" onPress={() => router.push('/(tabs)/services')}>
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                {t('home.viewAllServices')}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primary} />
            </View>
          </Button>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
