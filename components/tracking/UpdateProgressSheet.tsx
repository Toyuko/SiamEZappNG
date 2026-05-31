import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, Paperclip, X } from 'lucide-react-native';

import type { TrackingStatus } from '../../services/tracking.types';
import type { TrackingStep } from '../../lib/jobs/tracking-steps';
import {
  prepareTrackingImage,
  TRACKING_IMAGE_PICKER_OPTIONS,
} from '../../lib/uploads/tracking-image';
import { captureCurrentPositionAsync } from '../../services/locationService';
import {
  updateJobTracking,
  uploadTrackingAttachment,
} from '../../services/trackingApi';
import { Button } from '../ui/Button';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { t } from '../../lib/i18n/i18n';

type PendingAttachment = {
  uri: string;
  name: string;
  mimeType: string;
};

type UpdateProgressSheetProps = {
  visible: boolean;
  jobId: string;
  steps: TrackingStep[];
  currentStatus: TrackingStatus | null;
  currentNotes?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export function UpdateProgressSheet({
  visible,
  jobId,
  steps,
  currentStatus,
  currentNotes,
  onClose,
  onSaved,
}: UpdateProgressSheetProps) {
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const [status, setStatus] = useState<TrackingStatus>(currentStatus ?? steps[0]?.key ?? 'DOCUMENTS_PENDING');
  const [notes, setNotes] = useState(currentNotes ?? '');
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStatus(currentStatus ?? steps[0]?.key ?? 'DOCUMENTS_PENDING');
      setNotes(currentNotes ?? '');
      setAttachment(null);
      setMessage(null);
    }
  }, [visible, currentStatus, currentNotes, steps]);

  async function handlePickImage(source: 'camera' | 'gallery') {
    setMessage(null);
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t('tracking.permissionRequired'), t('tracking.cameraAccessRequired'));
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(TRACKING_IMAGE_PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(TRACKING_IMAGE_PICKER_OPTIONS);

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    const name = asset.fileName ?? (source === 'camera' ? 'camera-receipt.jpg' : 'gallery-receipt.jpg');
    const mimeType = asset.mimeType ?? 'image/jpeg';

    try {
      const prepared = await prepareTrackingImage(asset.uri, name, mimeType, asset.fileSize);
      setAttachment({ uri: prepared.uri, name: prepared.name, mimeType: prepared.mimeType });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t('tracking.uploadFailed'));
    }
  }

  async function handlePickDocument() {
    setMessage(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'application/octet-stream';
    const name = asset.name ?? 'attachment';

    try {
      if (mimeType.startsWith('image/')) {
        const prepared = await prepareTrackingImage(asset.uri, name, mimeType, asset.size);
        setAttachment({ uri: prepared.uri, name: prepared.name, mimeType: prepared.mimeType });
      } else {
        setAttachment({ uri: asset.uri, name, mimeType });
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t('tracking.uploadFailed'));
    }
  }

  async function handleSubmit() {
    setBusy(true);
    setMessage(null);

    try {
      let attachmentPayload: { url: string; name: string } | null = null;
      if (attachment) {
        try {
          const uploaded = await uploadTrackingAttachment(jobId, attachment);
          if (!uploaded.url) {
            throw new Error(t('tracking.uploadFailed'));
          }
          attachmentPayload = { url: uploaded.url, name: uploaded.name ?? attachment.name };
        } catch (uploadErr) {
          const uploadMessage =
            uploadErr instanceof Error ? uploadErr.message : t('tracking.uploadFailed');
          Alert.alert(t('tracking.uploadFailed'), uploadMessage);
          setMessage(uploadMessage);
          return;
        }
      }

      const coordinatesPromise = captureCurrentPositionAsync();
      const coordinates = await Promise.race([
        coordinatesPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 6_000)),
      ]);

      await updateJobTracking(jobId, {
        status,
        notes: notes.trim() || null,
        attachmentUrl: attachmentPayload?.url ?? null,
        attachmentName: attachmentPayload?.name ?? null,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
      });

      setMessage(t('tracking.updateSaved'));
      onSaved();
      onClose();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t('tracking.updateFailed'));
    } finally {
      setBusy(false);
    }
  }

  function stepLabel(step: TrackingStep) {
    return language === 'th' ? `${step.th} / ${step.en}` : `${step.en} / ${step.th}`;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.back')} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
            },
          ]}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
              {t('tracking.updateProgress')}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              style={{ minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={22} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ gap: spacing.stackMd, paddingBottom: spacing.stackLg }}>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('tracking.updateProgressHint')}
            </Text>

            <View style={{ gap: spacing.stackSm }}>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.muted }}>
                {t('tracking.statusLabel')}
              </Text>
              <View style={{ gap: spacing.stackSm }}>
                {steps.map((step) => {
                  const selected = step.key === status;
                  return (
                    <Pressable
                      key={step.key}
                      onPress={() => setStatus(step.key)}
                      disabled={busy}
                      style={{
                        minHeight: 48,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? `${colors.primary}12` : colors.card,
                        paddingHorizontal: spacing.stackMd,
                        justifyContent: 'center',
                      }}
                    >
                      <Text className="text-sm font-medium" style={{ color: selected ? colors.primary : colors.foreground }}>
                        {stepLabel(step)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ gap: spacing.stackSm }}>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.muted }}>
                {t('tracking.notesLabel')}
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                editable={!busy}
                multiline
                placeholder={t('tracking.notesPlaceholder')}
                placeholderTextColor={colors.muted}
                style={{
                  minHeight: 88,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.stackMd,
                  color: colors.foreground,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            <View style={{ gap: spacing.stackSm }}>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.muted }}>
                {t('tracking.attachmentLabel')}
              </Text>
              {attachment ? (
                <View
                  className="flex-row items-center justify-between"
                  style={{
                    minHeight: 48,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: spacing.stackMd,
                  }}
                >
                  <View className="flex-row items-center gap-2" style={{ flex: 1 }}>
                    <Paperclip size={16} color={colors.primary} />
                    <Text className="text-sm" numberOfLines={1} style={{ color: colors.foreground, flex: 1 }}>
                      {attachment.name}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setAttachment(null)}
                    disabled={busy}
                    style={{ minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={18} color={colors.muted} />
                  </Pressable>
                </View>
              ) : (
                <View style={{ gap: spacing.stackSm }}>
                  <Button
                    label={t('tracking.takePhoto')}
                    onPress={() => void handlePickImage('camera')}
                    disabled={busy}
                  />
                  <Button
                    label={t('tracking.uploadGallery')}
                    variant="secondary"
                    onPress={() => void handlePickImage('gallery')}
                    disabled={busy}
                  />
                  <Pressable
                    onPress={() => void handlePickDocument()}
                    disabled={busy}
                    style={{
                      minHeight: 48,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.stackSm,
                    }}
                  >
                    <ImageIcon size={18} color={colors.primary} />
                    <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                      {t('tracking.browseFiles')}
                    </Text>
                  </Pressable>
                </View>
              )}
              <Text className="text-xs" style={{ color: colors.muted }}>
                {t('tracking.attachmentTypes')}
              </Text>
            </View>

            {message ? (
              <Text className="text-sm" style={{ color: message === t('tracking.updateSaved') ? colors.success : '#d97706' }}>
                {message}
              </Text>
            ) : null}

            <Button
              label={busy ? t('tracking.saving') : t('tracking.saveProgress')}
              disabled={busy}
              onPress={() => void handleSubmit()}
            />
            {busy ? <ActivityIndicator color={colors.primary} /> : null}
          </ScrollView>
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
    paddingTop: spacing.stackLg,
    paddingBottom: spacing.sectionGap,
  },
});
