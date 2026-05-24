import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import type { TrackingHistoryEntry, TrackingStatus } from '../../types/tracking';
import type { TrackingStep } from '../../lib/jobs/tracking-steps';
import { getTrackingStepIndex } from '../../lib/jobs/tracking-steps';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

import { TrackingAttachmentView } from './TrackingAttachmentView';

type StepState = 'completed' | 'active' | 'pending';

type TrackingStepperProps = {
  steps: TrackingStep[];
  currentStatus: TrackingStatus | null;
  trackingHistory?: TrackingHistoryEntry[];
  notes?: string | null;
  emptyMessage?: string;
};

function historyByStatus(history: TrackingHistoryEntry[]): Map<TrackingStatus, TrackingHistoryEntry> {
  const map = new Map<TrackingStatus, TrackingHistoryEntry>();
  for (const entry of history) {
    map.set(entry.status, entry);
  }
  return map;
}

function formatTimestamp(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === 'th' ? 'th-TH' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function ActiveStepDot({ color }: { color: string }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulse }],
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: `${color}40`,
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: radius.full,
          backgroundColor: '#ffffff',
        }}
      />
    </Animated.View>
  );
}

export function TrackingStepper({
  steps,
  currentStatus,
  trackingHistory = [],
  notes,
  emptyMessage,
}: TrackingStepperProps & { emptyMessage?: string }) {
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);

  if (steps.length === 0) {
    return (
      <View
        style={{
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.cardPaddingCompact,
        }}
      >
        <Text className="text-center text-sm" style={{ color: colors.muted }}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  const historyMap = historyByStatus(trackingHistory);
  const currentIndex = getTrackingStepIndex(steps, currentStatus);
  const resolvedIndex = currentIndex < 0 ? 0 : currentIndex;

  function stepState(index: number, stepKey: TrackingStatus): StepState {
    if (stepKey === currentStatus) {
      return 'active';
    }
    if (index < resolvedIndex) {
      return 'completed';
    }
    if (historyMap.has(stepKey) && stepKey !== currentStatus) {
      return 'completed';
    }
    return 'pending';
  }

  return (
    <View style={{ gap: spacing.stackMd }}>
      {steps.map((step, index) => {
        const state = stepState(index, step.key);
        const entry = historyMap.get(step.key);
        const isCompleted = state === 'completed';
        const isActive = state === 'active';
        const label = language === 'th' ? step.th : step.en;
        const subLabel = language === 'th' ? step.en : step.th;

        return (
          <View key={step.key} className="flex-row items-start" style={{ gap: spacing.stackMd }}>
            <View className="items-center">
              {isActive ? (
                <ActiveStepDot color={colors.primary} />
              ) : (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radius.full,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCompleted ? colors.success : colors.card,
                    borderWidth: isCompleted ? 0 : 1,
                    borderColor: colors.border,
                  }}
                >
                  {isCompleted ? (
                    <Check size={16} color="#ffffff" strokeWidth={2.5} />
                  ) : (
                    <Text className="text-xs font-semibold" style={{ color: colors.muted }}>
                      {index + 1}
                    </Text>
                  )}
                </View>
              )}
              {index < steps.length - 1 ? (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 32,
                    marginTop: 4,
                    backgroundColor: index < resolvedIndex ? colors.success : colors.border,
                  }}
                />
              ) : null}
            </View>

            <View style={{ flex: 1, paddingBottom: spacing.stackMd }}>
              <Text
                className="text-sm font-semibold"
                style={{ color: isActive ? colors.primary : isCompleted ? colors.success : colors.foreground }}
              >
                {label}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>
                {subLabel}
              </Text>
              {entry ? (
                <Text className="mt-1 text-xs" style={{ color: colors.muted }}>
                  {formatTimestamp(entry.createdAt, language)}
                </Text>
              ) : null}
              {entry?.note ? (
                <View
                  style={{
                    marginTop: spacing.stackSm,
                    borderRadius: radius.sm,
                    backgroundColor: `${siam.blue.DEFAULT}12`,
                    padding: spacing.stackSm,
                  }}
                >
                  <Text className="text-xs leading-5" style={{ color: colors.foreground }}>
                    {entry.note}
                  </Text>
                </View>
              ) : null}
              {entry?.attachmentUrl ? (
                <TrackingAttachmentView
                  attachmentUrl={entry.attachmentUrl}
                  attachmentName={entry.attachmentName}
                />
              ) : null}
            </View>
          </View>
        );
      })}

      {notes && !trackingHistory.some((entry) => entry.note === notes) ? (
        <View
          style={{
            borderRadius: radius.sm,
            backgroundColor: `${siam.blue.DEFAULT}12`,
            padding: spacing.cardPaddingCompact,
          }}
        >
          <Text className="text-xs font-semibold" style={{ color: colors.foreground }}>
            {language === 'th' ? 'หมายเหตุ' : 'Remark'}
          </Text>
          <Text className="mt-1 text-xs leading-5" style={{ color: colors.foreground }}>
            {notes}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
