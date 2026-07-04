import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../ui/Button';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { useOnboardingStore } from '../../lib/onboarding/useOnboardingStore';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

type TutorialAudience = 'guest' | 'client' | 'freelancer';

type TutorialStep = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const GUEST_STEPS: TutorialStep[] = [
  { key: 'welcome', icon: 'sparkles-outline' },
  { key: 'explore', icon: 'search-outline' },
  { key: 'tabs', icon: 'grid-outline' },
  { key: 'voice', icon: 'mic-outline' },
  { key: 'account', icon: 'person-circle-outline' },
];

const CLIENT_STEPS: TutorialStep[] = [
  { key: 'welcome', icon: 'sparkles-outline' },
  { key: 'dashboard', icon: 'speedometer-outline' },
  { key: 'book', icon: 'calendar-outline' },
  { key: 'cases', icon: 'briefcase-outline' },
  { key: 'more', icon: 'menu-outline' },
];

const FREELANCER_STEPS: TutorialStep[] = [
  { key: 'welcome', icon: 'sparkles-outline' },
  { key: 'jobs', icon: 'construct-outline' },
  { key: 'accept', icon: 'checkmark-circle-outline' },
  { key: 'tracking', icon: 'navigate-outline' },
  { key: 'earnings', icon: 'wallet-outline' },
];

function resolveAudience(isGuest: boolean, isFreelancer: boolean): TutorialAudience {
  if (isGuest) {
    return 'guest';
  }
  if (isFreelancer) {
    return 'freelancer';
  }
  return 'client';
}

export function AppTutorial() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const language = useLanguageStore((state) => state.language);
  const { isGuest, userRole, user } = useAuthStore();
  const hasCompletedTutorial = useOnboardingStore((state) => state.hasCompletedTutorial);
  const completeTutorial = useOnboardingStore((state) => state.completeTutorial);
  const isFreelancer = userRole === 'freelancer' || user?.role === 'freelancer';
  const isE2E = process.env.EXPO_PUBLIC_E2E === 'true';

  const [hydrated, setHydrated] = useState(() => useOnboardingStore.persist.hasHydrated());
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const audience = resolveAudience(isGuest, isFreelancer);
  const steps = useMemo(() => {
    if (audience === 'guest') {
      return GUEST_STEPS;
    }
    if (audience === 'freelancer') {
      return FREELANCER_STEPS;
    }
    return CLIENT_STEPS;
  }, [audience]);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (hydrated) {
      return;
    }
    const unsub = useOnboardingStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || hasCompletedTutorial || isE2E) {
      setVisible(false);
      return;
    }
    setStepIndex(0);
    setVisible(true);
  }, [audience, hasCompletedTutorial, hydrated, isE2E]);

  const finishTutorial = useCallback(() => {
    completeTutorial();
    setVisible(false);
  }, [completeTutorial]);

  const handleSkip = useCallback(() => {
    finishTutorial();
  }, [finishTutorial]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      finishTutorial();
      return;
    }
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }, [finishTutorial, isLastStep, steps.length]);

  if (!visible || !currentStep) {
    return null;
  }

  const title = t(`tutorial.${audience}.${currentStep.key}.title`);
  const description = t(`tutorial.${audience}.${currentStep.key}.description`);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleSkip}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          justifyContent: 'center',
          paddingHorizontal: spacing.screenPaddingX,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tutorial.skip')}
          onPress={handleSkip}
          style={{
            alignSelf: 'flex-end',
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '600' }}>{t('tutorial.skip')}</Text>
        </Pressable>

        <View
          key={`${audience}-${currentStep.key}-${language}`}
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.xl,
            padding: spacing.cardPadding,
            width: '100%',
            maxWidth: Math.min(width - spacing.screenPaddingX * 2, 420),
            alignSelf: 'center',
            gap: spacing.stackLg,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${colors.primary}18`,
            }}
          >
            <Ionicons name={currentStep.icon} size={32} color={colors.primary} />
          </View>

          <View style={{ gap: spacing.stackSm }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.mutedText }}>
              {t('tutorial.stepOf', { current: stepIndex + 1, total: steps.length })}
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>{title}</Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.mutedText }}>{description}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            {steps.map((step, index) => (
              <View
                key={step.key}
                style={{
                  width: index === stepIndex ? 20 : 8,
                  height: 8,
                  borderRadius: radius.full,
                  backgroundColor: index === stepIndex ? colors.primary : colors.border,
                }}
              />
            ))}
          </View>

          <Button
            label={isLastStep ? t('tutorial.done') : t('common.next')}
            onPress={handleNext}
            gradient
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}
