import { useState } from 'react';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { FileText, Paperclip, X } from 'lucide-react-native';

import { isPdfAttachment, isTrackingAttachmentImage } from '../../lib/uploads/tracking-image';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { t } from '../../lib/i18n/i18n';

type TrackingAttachmentViewProps = {
  attachmentUrl: string;
  attachmentName?: string | null;
};

export function TrackingAttachmentView({ attachmentUrl, attachmentName }: TrackingAttachmentViewProps) {
  const { colors } = useTheme();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const label = attachmentName ?? t('tracking.viewAttachment');
  const isImage = isTrackingAttachmentImage(attachmentUrl, attachmentName);

  async function openPdf() {
    await WebBrowser.openBrowserAsync(attachmentUrl);
  }

  if (isImage) {
    return (
      <>
        <Pressable
          onPress={() => setLightboxOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={{ marginTop: spacing.stackSm, minHeight: 48, minWidth: 48 }}
        >
          <Image
            source={{ uri: attachmentUrl }}
            style={{
              width: 72,
              height: 72,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            resizeMode="cover"
          />
          <View className="mt-1 flex-row items-center gap-1">
            <Paperclip size={12} color={colors.primary} />
            <Text className="text-xs font-medium" style={{ color: colors.primary }}>
              {t('tracking.viewAttachment')}
            </Text>
          </View>
        </Pressable>

        <Modal visible={lightboxOpen} transparent animationType="fade" onRequestClose={() => setLightboxOpen(false)}>
          <Pressable
            className="flex-1 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
            onPress={() => setLightboxOpen(false)}
          >
            <Pressable
              onPress={() => setLightboxOpen(false)}
              accessibilityRole="button"
              accessibilityLabel={t('tracking.closeLightbox')}
              style={{
                position: 'absolute',
                top: 48,
                right: 20,
                minHeight: 48,
                minWidth: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={28} color="#ffffff" />
            </Pressable>
            <Image
              source={{ uri: attachmentUrl }}
              style={{ width: '92%', height: '70%', borderRadius: radius.md }}
              resizeMode="contain"
            />
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <Pressable
      onPress={() => void openPdf()}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        marginTop: spacing.stackSm,
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.stackSm,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.stackMd,
        paddingVertical: spacing.stackSm,
        alignSelf: 'flex-start',
      }}
    >
      <FileText size={18} color={colors.primary} />
      <Text className="text-xs font-medium" numberOfLines={1} style={{ color: colors.primary, maxWidth: 200 }}>
        {label}
      </Text>
      {isPdfAttachment(attachmentUrl, attachmentName) ? (
        <Text className="text-[10px] uppercase" style={{ color: colors.muted }}>
          PDF
        </Text>
      ) : null}
    </Pressable>
  );
}
