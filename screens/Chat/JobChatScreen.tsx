import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Paperclip, Send as SendIcon } from 'lucide-react-native';
import { Bubble, GiftedChat, type IMessage } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { getFreelancerJobById } from '../../features/freelancer/freelancer.api';
import { toGiftedChatMessage, toGiftedChatMessages } from '../../lib/chat/message-mapper';
import { t } from '../../lib/i18n/i18n';
import { prepareTrackingImage } from '../../lib/uploads/tracking-image';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import {
  fetchJobChatHistory,
  postJobChatMessage,
  uploadChatAttachment,
} from '../../services/jobChatApi';
import { useJobChatRealtime } from '../../hooks/use-job-chat-realtime';
import { fetchClientJobTracking } from '../../services/trackingApi';
import { useAuthStore } from '../../store/auth-store';
import type { JobChatMeta, JobChatRealtimeConfig, WebChatParticipant } from '../../types/chat';

/** Compressed gallery/camera picks for chat uploads (Step 1). */
const CHAT_IMAGE_PICKER_OPTIONS = {
  mediaTypes: ['images'] as ('images' | 'videos' | 'livePhotos')[],
  quality: 0.5,
  allowsEditing: false,
  exif: false,
} as const;

type JobChatScreenProps = {
  jobId: string;
  role: 'client' | 'freelancer';
};

async function resolveChatMetaFallback(
  jobId: string,
  role: 'client' | 'freelancer',
): Promise<Pick<JobChatMeta, 'counterpart' | 'serviceName' | 'jobTitle'>> {
  if (role === 'freelancer') {
    const job = await getFreelancerJobById(jobId);
    const name = job.postedBy?.name?.trim() || job.postedBy?.email || t('common.unknownUser');
    return {
      jobTitle: job.title,
      serviceName: job.service?.name ?? null,
      counterpart: {
        id: job.postedBy.id,
        name,
        role: 'client',
      },
    };
  }

  const tracking = await fetchClientJobTracking(jobId);
  const name =
    tracking.job.freelancer?.displayName?.trim() || t('tracking.freelancerPending');
  return {
    jobTitle: tracking.job.title,
    serviceName: tracking.job.service?.name ?? null,
    counterpart: {
      id: tracking.job.id,
      name,
      role: 'freelancer',
    },
  };
}

export function JobChatScreen({ jobId, role }: JobChatScreenProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, userRole, isGuest, accessToken } = useAuthStore();
  const currentUserId = user?.id ?? '';

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [meta, setMeta] = useState<JobChatMeta | null>(null);
  const [webParticipant, setWebParticipant] = useState<WebChatParticipant | null>(null);
  const [realtime, setRealtime] = useState<JobChatRealtimeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const seenMessageIds = useRef(new Set<string>());
  const isFocused = useIsFocused();

  const trackingPath = role === 'freelancer' ? `/freelancer/tracking/${jobId}` : `/client/tracking/${jobId}`;

  const appendUnique = useCallback((incoming: IMessage[]) => {
    setMessages((previous) => {
      const fresh = incoming.filter((message) => {
        const id = String(message._id);
        if (seenMessageIds.current.has(id)) {
          return false;
        }
        seenMessageIds.current.add(id);
        return true;
      });
      if (fresh.length === 0) {
        return previous;
      }
      return GiftedChat.append(previous, fresh);
    });
  }, []);

  const loadChat = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const history = await fetchJobChatHistory(jobId, currentUserId);
      const fallbackMeta = history.meta ?? (await resolveChatMetaFallback(jobId, role));
      const resolvedMeta: JobChatMeta = {
        jobId,
        jobTitle: history.meta?.jobTitle ?? fallbackMeta.jobTitle ?? null,
        serviceName: history.meta?.serviceName ?? fallbackMeta.serviceName ?? null,
        counterpart: history.meta?.counterpart ?? fallbackMeta.counterpart,
      };

      setMeta(resolvedMeta);
      setWebParticipant(history.participant ?? null);
      setRealtime(history.realtime ?? null);

      const gifted = toGiftedChatMessages(history.messages ?? [], currentUserId);
      seenMessageIds.current = new Set(gifted.map((message) => String(message._id)));
      setMessages(gifted);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('chat.loadError'));
    } finally {
      setLoading(false);
    }
  }, [currentUserId, jobId, role]);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
      return;
    }
    if (role === 'freelancer' && userRole === 'client') {
      router.replace('/(tabs)/dashboard');
      return;
    }
    if (role === 'client' && userRole === 'freelancer') {
      router.replace('/(tabs)/freelancer');
    }
  }, [accessToken, isGuest, role, router, userRole]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }
    void loadChat();
  }, [currentUserId, loadChat]);

  const handleRealtimeMessage = useCallback(
    (dto: Parameters<typeof toGiftedChatMessage>[0]) => {
      const mapped = toGiftedChatMessage(dto, currentUserId);
      appendUnique([mapped]);
    },
    [appendUnique, currentUserId],
  );

  const syncMessages = useCallback(async () => {
    if (!currentUserId) {
      return;
    }
    try {
      const history = await fetchJobChatHistory(jobId, currentUserId);
      const gifted = toGiftedChatMessages(history.messages ?? [], currentUserId);
      appendUnique(gifted);
    } catch {
      // Background poll — ignore transient failures.
    }
  }, [appendUnique, currentUserId, jobId]);

  const { isLive } = useJobChatRealtime({
    jobId,
    enabled: isFocused && !loading && Boolean(currentUserId),
    realtime,
    participant: webParticipant,
    onMessage: handleRealtimeMessage,
    onSync: syncMessages,
  });

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(trackingPath);
  }, [router, trackingPath]);

  const handleViewJob = useCallback(() => {
    router.push(trackingPath);
  }, [router, trackingPath]);

  const giftedUser = useMemo(
    () => ({
      _id: currentUserId,
      name: user?.name ?? user?.email,
    }),
    [currentUserId, user?.email, user?.name],
  );

  const onSend = useCallback(
    async (outgoing: IMessage[] = []) => {
      const draft = outgoing[0];
      const text = draft?.text?.trim() ?? '';
      const preUploadedImageUrl = typeof draft?.image === 'string' ? draft.image : null;
      if (!text && !preUploadedImageUrl) {
        return;
      }
      if (sending || uploading) {
        return;
      }

      setSending(true);
      try {
        if (!webParticipant) {
          throw new Error(t('chat.loadError'));
        }

        const { message } = await postJobChatMessage(
          jobId,
          {
            content: text,
            attachmentUrl: preUploadedImageUrl,
          },
          webParticipant,
        );

        const mapped = toGiftedChatMessage(message, currentUserId);
        appendUnique([mapped]);
      } catch (err) {
        Alert.alert(
          preUploadedImageUrl ? t('chat.uploadFailedTitle') : t('chat.sendFailedTitle'),
          err instanceof Error ? err.message : preUploadedImageUrl ? t('chat.uploadFailed') : t('chat.sendFailed'),
        );
      } finally {
        setSending(false);
      }
    },
    [appendUnique, currentUserId, jobId, sending, uploading, webParticipant],
  );

  const pickImageAndSend = useCallback(
    async (source: 'camera' | 'gallery') => {
      if (sending || uploading) {
        return;
      }

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
          ? await ImagePicker.launchCameraAsync(CHAT_IMAGE_PICKER_OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(CHAT_IMAGE_PICKER_OPTIONS);

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      const asset = result.assets[0];
      const imageUri = asset.uri;
      const filename = asset.fileName ?? (source === 'camera' ? 'chat-photo.jpg' : 'chat-image.jpg');
      const fileType = asset.mimeType ?? 'image/jpeg';

      setUploading(true);
      let uploadedUrl: string | null = null;
      try {
        await prepareTrackingImage(imageUri, filename, fileType, asset.fileSize);
        const uploaded = await uploadChatAttachment(jobId, {
          uri: imageUri,
          name: filename,
          mimeType: fileType,
        });
        if (!uploaded?.url) {
          throw new Error(t('chat.uploadFailed'));
        }
        uploadedUrl = uploaded.url;
      } catch (err) {
        Alert.alert(t('chat.uploadFailedTitle'), err instanceof Error ? err.message : t('chat.uploadFailed'));
        return;
      } finally {
        setUploading(false);
      }

      if (!uploadedUrl) {
        return;
      }

      await onSend([
        {
          _id: `local-${Date.now()}`,
          text: '',
          image: uploadedUrl,
          createdAt: new Date(),
          user: giftedUser,
        },
      ]);
    },
    [giftedUser, jobId, onSend, sending, uploading],
  );

  const headerTitle = meta?.counterpart?.name?.trim() || t('common.unknownUser');
  const headerSubtitle = meta?.serviceName?.trim() || meta?.jobTitle?.trim() || t('chat.defaultSubtitle');

  const chatTheme = useMemo(
    () => ({
      wrapperStyle: { backgroundColor: colors.background },
      inputToolbar: {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
      },
      composer: { color: colors.foreground },
      send: { color: colors.primary },
      bubbleLeft: { backgroundColor: isDark ? '#1e293b' : '#f3f4f6' },
      bubbleRight: { backgroundColor: siam.blue.DEFAULT },
      textLeft: { color: colors.foreground },
      textRight: { color: '#ffffff' },
    }),
    [colors.background, colors.border, colors.card, colors.foreground, colors.primary, isDark],
  );

  if (loading) {
    return <LoadingState label={t('chat.loading')} />;
  }

  if (loadError) {
    return <ErrorState label={loadError} onRetry={() => void loadChat()} />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: spacing.stackSm }}>
        <PageHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          onBack={handleBack}
          backLabel={t('tracking.backToPortal')}
          rightSlot={
            <Pressable
              onPress={handleViewJob}
              accessibilityRole="button"
              accessibilityLabel={t('chat.viewJobDetails')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.35)',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>{t('chat.viewJobDetails')}</Text>
            </Pressable>
          }
        />
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isLive ? '#22c55e' : colors.muted,
              }}
            />
            <Text className="text-xs font-medium" style={{ color: colors.muted }}>
              {isLive ? t('chat.live') : t('chat.connecting')}
            </Text>
          </View>
          {(sending || uploading) && (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-xs" style={{ color: colors.muted }}>
                {uploading ? t('chat.uploading') : t('chat.sending')}
              </Text>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={(outgoing) => void onSend(outgoing)}
          user={giftedUser}
          placeholder={t('chat.placeholder')}
          isSendButtonAlwaysVisible
          renderAvatar={null}
          keyboardAvoidingViewProps={{ enabled: false }}
          messagesContainerStyle={chatTheme.wrapperStyle}
          renderActions={() => (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 4, gap: 2 }}>
              <Pressable
                onPress={() => void pickImageAndSend('gallery')}
                disabled={sending || uploading}
                accessibilityRole="button"
                accessibilityLabel={t('chat.attachTitle')}
                style={{ padding: 8 }}
              >
                <Paperclip size={22} color={colors.primary} strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={() => void pickImageAndSend('camera')}
                disabled={sending || uploading}
                accessibilityRole="button"
                accessibilityLabel={t('tracking.takePhoto')}
                style={{ padding: 8 }}
              >
                <Camera size={22} color={colors.primary} strokeWidth={2} />
              </Pressable>
            </View>
          )}
          renderSend={(props) => {
            const canSend = Boolean(props.text?.trim());
            const disabled = !canSend || sending || uploading;

            return (
              <Pressable
                onPress={() => {
                  if (disabled || !props.onSend) {
                    return;
                  }
                  props.onSend({ text: props.text?.trim() || ' ' }, true);
                }}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={t('chat.send')}
                style={{
                  marginRight: 8,
                  marginBottom: 6,
                  backgroundColor: disabled ? (isDark ? '#475569' : '#94a3b8') : siam.blue.DEFAULT,
                  borderRadius: 22,
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  minWidth: 92,
                  justifyContent: 'center',
                  shadowColor: siam.blue.dark,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: disabled ? 0 : 0.28,
                  shadowRadius: 4,
                  elevation: disabled ? 0 : 3,
                }}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <SendIcon size={18} color="#ffffff" strokeWidth={2.5} />
                )}
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>
                  {uploading ? t('chat.uploading') : sending ? t('chat.sending') : t('chat.send')}
                </Text>
              </Pressable>
            );
          }}
          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                right: { backgroundColor: chatTheme.bubbleRight.backgroundColor },
                left: { backgroundColor: chatTheme.bubbleLeft.backgroundColor },
              }}
              textStyle={{
                right: { color: chatTheme.textRight.color },
                left: { color: chatTheme.textLeft.color },
              }}
            />
          )}
          renderMessageImage={(props) => {
            const uri = props.currentMessage?.image;
            if (!uri) {
              return null;
            }
            return (
              <Image
                source={{ uri }}
                style={{ width: 200, height: 140, borderRadius: 12, margin: 4 }}
                resizeMode="cover"
                accessibilityLabel={t('tracking.viewAttachment')}
              />
            );
          }}
          textInputProps={{
            style: { color: colors.foreground, fontSize: 16, lineHeight: 22 },
            placeholderTextColor: colors.muted,
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
