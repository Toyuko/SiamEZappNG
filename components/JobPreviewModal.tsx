import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Tag, Wallet, FileText } from 'lucide-react-native';

import { Button } from './ui/Button';
import { feedPayoutAmount } from '../lib/jobs/job-board-mapper';
import { formatJobAmount } from '../lib/jobs/format-amount';
import { t } from '../lib/i18n/i18n';
import { radius, spacing } from '../lib/theme/tokens';
import { useTheme } from '../lib/theme/theme';
import type { JobBoardFeedItem } from '../types/job-board';

type JobPreviewModalProps = {
  visible: boolean;
  job: JobBoardFeedItem | null;
  accepting?: boolean;
  onClose: () => void;
  onAccept: () => void;
};

function PreviewRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.muted }}>
          {label}
        </Text>
      </View>
      <Text style={{ fontSize: 15, lineHeight: 22, color: colors.foreground }}>{value}</Text>
    </View>
  );
}

export function JobPreviewModal({
  visible,
  job,
  accepting = false,
  onClose,
  onAccept,
}: JobPreviewModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!job) {
    return null;
  }

  const category = job.category ?? job.service?.name ?? t('freelancer.jobPreview.categoryFallback');
  const location =
    job.location?.trim() ||
    job.service?.name ||
    t('freelancer.jobPreview.locationNotSpecified');
  const clientNotes = (job.clientNotes ?? job.description).trim() || t('freelancer.jobPreview.noClientNotes');
  const budget = formatJobAmount(feedPayoutAmount(job), job.currency || 'THB');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('freelancer.jobPreview.close')}
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

          <Text className="text-lg font-semibold" style={{ color: colors.foreground, marginBottom: spacing.stackMd }}>
            {t('freelancer.jobPreview.title')}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.stackMd, paddingBottom: spacing.stackLg }}
          >
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              {job.title}
            </Text>

            <PreviewRow
              icon={<Tag size={14} color={colors.primary} strokeWidth={2} />}
              label={t('freelancer.jobPreview.category')}
              value={category}
            />

            <PreviewRow
              icon={<Wallet size={14} color={colors.primary} strokeWidth={2} />}
              label={t('freelancer.jobPreview.budget')}
              value={budget}
            />

            <PreviewRow
              icon={<MapPin size={14} color={colors.primary} strokeWidth={2} />}
              label={t('freelancer.jobPreview.location')}
              value={location}
            />

            <PreviewRow
              icon={<FileText size={14} color={colors.primary} strokeWidth={2} />}
              label={t('freelancer.jobPreview.clientNotes')}
              value={clientNotes}
            />

            {job.isSpecialMemberOnly ? (
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                {t('freelancer.specialMemberOnly')}
              </Text>
            ) : null}
          </ScrollView>

          <View style={{ gap: spacing.stackSm, paddingTop: spacing.stackSm }}>
            {accepting ? (
              <View
                style={{
                  minHeight: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.button,
                  backgroundColor: colors.primary,
                }}
              >
                <ActivityIndicator color="#ffffff" accessibilityLabel={t('freelancer.jobPreview.accepting')} />
              </View>
            ) : (
              <Button label={t('freelancer.jobPreview.acceptThisJob')} size="lg" onPress={onAccept} />
            )}
            <Pressable
              onPress={onClose}
              disabled={accepting}
              accessibilityRole="button"
              accessibilityLabel={t('freelancer.jobPreview.close')}
              style={{
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: accepting ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '500', color: colors.muted }}>
                {t('freelancer.jobPreview.cancel')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
