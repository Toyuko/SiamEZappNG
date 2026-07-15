import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FadeInView } from '../ui/FadeInView';
import { LanguageToggle } from '../ui/LanguageToggle';
import { PageHeader } from '../ui/PageHeader';
import { Section } from '../ui/Section';
import { TestimonialCard } from '../ui/TestimonialCard';
import { ThemePicker } from '../ui/ThemePicker';
import { TrustStats } from '../ui/TrustStats';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

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

const HOW_IT_WORKS_STEPS = [
  { icon: 'search-outline' as const, titleKey: 'home.howItWorks.step1Title', bodyKey: 'home.howItWorks.step1Body' },
  { icon: 'calendar-outline' as const, titleKey: 'home.howItWorks.step2Title', bodyKey: 'home.howItWorks.step2Body' },
  { icon: 'checkmark-circle-outline' as const, titleKey: 'home.howItWorks.step3Title', bodyKey: 'home.howItWorks.step3Body' },
];

export function GuestHomeContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const [preferencesExpanded, setPreferencesExpanded] = useState(false);
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

  return (
    <>
      <FadeInView delay={0} distance={22}>
        <PageHeader
          badge={t('home.badge')}
          title={t('home.title')}
          subtitle={t('home.subtitle')}
          primaryCta={{ label: t('cta.getStarted'), onPress: () => router.push('/(auth)/signup') }}
          secondaryCta={{
            label: t('home.browseServices'),
            onPress: () => router.push('/(tabs)/services'),
          }}
        />
      </FadeInView>

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
          <View className="mt-4 gap-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-medium" style={{ color: colors.muted }}>
                {t('settings.theme')}
              </Text>
              <ThemePicker />
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-medium" style={{ color: colors.muted }}>
                {t('settings.language')}
              </Text>
              <LanguageToggle />
            </View>
          </View>
        ) : null}
      </Card>

      <FadeInView delay={120}>
        <TrustStats />
      </FadeInView>

      <Section title={t('home.howItWorks.title')} subtitle={t('home.howItWorks.subtitle')}>
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <FadeInView key={step.titleKey} delay={160 + index * 70} distance={16}>
            <Card>
              <View className="flex-row items-start gap-3">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${colors.primary}1F` }}
                >
                  <Ionicons name={step.icon} size={22} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                    {`${index + 1}. ${String(t(step.titleKey))}`}
                  </Text>
                  <Text className="mt-1 text-sm leading-5" style={{ color: colors.muted }}>
                    {t(step.bodyKey)}
                  </Text>
                </View>
              </View>
            </Card>
          </FadeInView>
        ))}
      </Section>

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

      <FadeInView delay={280}>
        <Card>
          <Text className="text-lg font-bold tracking-tight" style={{ color: colors.foreground }}>
            {t('home.readyTitle')}
          </Text>
          <Text className="mt-1.5 text-sm leading-5" style={{ color: colors.muted }}>
            {t('home.readySubtitle')}
          </Text>
          <View className="mt-4 gap-3">
            <Button label={t('home.browseServices')} gradient onPress={() => router.push('/(tabs)/services')} />
            <Button label={t('cta.bookNow')} variant="secondary" onPress={() => router.push('/(tabs)/book')} />
            <Button
              label={t('freelancer.publicProfile.directory.title')}
              variant="secondary"
              onPress={() => router.push('/freelancers')}
            />
          </View>
        </Card>
      </FadeInView>
    </>
  );
}
