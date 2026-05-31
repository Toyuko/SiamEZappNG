import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Star, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '../lib/i18n/i18n';
import { radius, spacing } from '../lib/theme/tokens';
import { useTheme } from '../lib/theme/theme';
import { submitJobReview } from '../services/trackingApi';

type ReviewBottomSheetProps = {
  visible: boolean;
  jobId: string;
  freelancerName?: string | null;
  onClose: () => void;
  onSubmitted: () => void;
};

const STAR_COUNT = 5;
const STAR_TOUCH_SIZE = 48;

function StarRatingRow({
  rating,
  onSelect,
  disabled,
}: {
  rating: number;
  onSelect: (value: number) => void;
  disabled: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.starRow}>
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const value = index + 1;
        const filled = value <= rating;
        return (
          <Pressable
            key={value}
            onPress={() => onSelect(value)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={t('review.starAccessibility', { count: value })}
            accessibilityState={{ selected: filled }}
            style={styles.starTouch}
          >
            <Star
              size={32}
              color={filled ? colors.primary : colors.muted}
              fill={filled ? colors.primary : 'transparent'}
              strokeWidth={filled ? 0 : 2}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function ReviewBottomSheet({
  visible,
  jobId,
  freelancerName,
  onClose,
  onSubmitted,
}: ReviewBottomSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment('');
      setSubmitting(false);
    }
  }, [visible]);

  async function handleSubmit() {
    if (rating < 1) {
      Alert.alert(t('review.ratingRequiredTitle'), t('review.ratingRequiredMessage'));
      return;
    }

    setSubmitting(true);
    try {
      await submitJobReview(jobId, { rating, comment: comment.trim() });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmitted();
      onClose();
      Alert.alert(t('review.thankYouTitle'), t('review.thankYouMessage'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('review.submitFailed');
      Alert.alert(t('review.submitFailedTitle'), message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                paddingBottom: Math.max(insets.bottom, spacing.sectionGap),
              },
            ]}
          >
            <View style={styles.handle} accessibilityElementsHidden>
              <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
            </View>

            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold" style={{ color: colors.foreground, flex: 1 }}>
                {t('review.sheetTitle')}
              </Text>
              <Pressable
                onPress={onClose}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel={t('common.back')}
                style={styles.closeTouch}
              >
                <X size={22} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.stackMd, paddingBottom: spacing.stackLg }}
            >
              <Text className="text-sm leading-5" style={{ color: colors.muted }}>
                {freelancerName
                  ? t('review.sheetSubtitleNamed', { name: freelancerName })
                  : t('review.sheetSubtitle')}
              </Text>

              <View style={{ gap: spacing.stackSm }}>
                <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.muted }}>
                  {t('review.ratingLabel')}
                </Text>
                <StarRatingRow rating={rating} onSelect={setRating} disabled={submitting} />
              </View>

              <View style={{ gap: spacing.stackSm }}>
                <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.muted }}>
                  {t('review.commentLabel')}
                </Text>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  editable={!submitting}
                  multiline
                  placeholder={t('review.commentPlaceholder')}
                  placeholderTextColor={colors.muted}
                  style={{
                    minHeight: 100,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing.stackMd,
                    color: colors.foreground,
                    textAlignVertical: 'top',
                  }}
                />
              </View>

              <Pressable
                onPress={() => void handleSubmit()}
                disabled={submitting || rating < 1}
                accessibilityRole="button"
                accessibilityLabel={t('review.submitReview')}
                accessibilityState={{ disabled: submitting || rating < 1, busy: submitting }}
                style={{
                  minHeight: 52,
                  borderRadius: radius.button,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: submitting || rating < 1 ? 0.6 : 1,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" accessibilityLabel={t('review.submitting')} />
                ) : (
                  <Text className="text-base font-semibold" style={{ color: '#ffffff' }}>
                    {t('review.submitReview')}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.stackMd,
  },
  handle: {
    alignItems: 'center',
    marginBottom: spacing.stackSm,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  closeTouch: {
    minHeight: STAR_TOUCH_SIZE,
    minWidth: STAR_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  starTouch: {
    minHeight: STAR_TOUCH_SIZE,
    minWidth: STAR_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
