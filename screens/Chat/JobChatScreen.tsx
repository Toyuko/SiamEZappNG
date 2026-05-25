import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Paperclip } from 'lucide-react-native';
import { Bubble, GiftedChat, type IMessage } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { getFreelancerJobById } from '../../features/freelancer/freelancer.api';
import { toGiftedChatMessage, toGiftedChatMessages } from '../../lib/chat/message-mapper';
import { t } from '../../lib/i18n/i18n';
import { prepareTrackingImage, TRACKING_IMAGE_PICKER_OPTIONS } from '../../lib/uploads/tracking-image';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import {
  fetchJobChatHistory,
  postJobChatMessage,
  uploadChatAttachment,
} from '../../services/jobChatApi';
import { useJobTrackingRealtime } from '../../hooks/use-job-tracking-realtime';
import { fetchClientJobTracking } from '../../services/trackingApi';
import { useAuthStore } from '../../store/auth-store';
import type { JobChatMeta, JobChatRealtimeConfig, WebChatParticipant } from '../../types/chat';
import { CHAT_ATTACHMENT_MAX_BYTES } from '../../types/chat';

type JobChatScreenProps = {
  jobId: string;
  role: 'client' | 'freelancer';
};

type PendingAttachment = {
  uri: string;
  name: string;
  mimeType: string;
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
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
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

  useJobTrackingRealtime({
    jobId,
    role,
    enabled: isFocused && !loading && Boolean(currentUserId),
    isChatFocused: true,
    realtime,
    onNewMessageWhileChatFocused: handleRealtimeMessage,
    onAppForeground: () => {
      void loadChat();
    },
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

  const uploadPendingAttachment = useCallback(async () => {
    if (!pendingAttachment) {
      return null;
    }
    setUploading(true);
    try {
      const uploaded = await uploadChatAttachment(jobId, pendingAttachment);
      return {
        url: uploaded.url,
        name: uploaded.name ?? pendingAttachment.name,
      };
    } finally {
      setUploading(false);
    }
  }, [jobId, pendingAttachment]);

  const onSend = useCallback(
    async (outgoing: IMessage[] = []) => {
      const draft = outgoing[0];
      const text = draft?.text?.trim() ?? '';
      if (!text && !pendingAttachment) {
        return;
      }
      if (sending || uploading) {
        return;
      }

      setSending(true);
      try {
        let attachmentUrl: string | null = null;
        let attachmentName: string | null = null;

        if (pendingAttachment) {
          const uploaded = await uploadPendingAttachment();
          if (!uploaded?.url) {
            throw new Error(t('chat.uploadFailed'));
          }
          attachmentUrl = uploaded.url;
          attachmentName = uploaded.name;
          setPendingAttachment(null);
        }

        if (!webParticipant) {
          throw new Error(t('chat.loadError'));
        }

        const { message } = await postJobChatMessage(
          jobId,
          {
            content: text || (attachmentName ? `📎 ${attachmentName}` : ''),
            attachmentUrl,
          },
          webParticipant,
        );

        const mapped = toGiftedChatMessage(message, currentUserId);
        appendUnique([mapped]);
      } catch (err) {
        Alert.alert(t('chat.sendFailedTitle'), err instanceof Error ? err.message : t('chat.sendFailed'));
      } finally {
        setSending(false);
      }
    },
    [appendUnique, currentUserId, jobId, pendingAttachment, sending, uploadPendingAttachment, uploading, webParticipant],
  );

  const pickImage = useCallback(async (source: 'camera' | 'gallery') => {
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
    const name = asset.fileName ?? (source === 'camera' ? 'chat-photo.jpg' : 'chat-image.jpg');
    const mimeType = asset.mimeType ?? 'image/jpeg';

    try {
      await prepareTrackingImage(asset.uri, name, mimeType);
      setPendingAttachment({ uri: asset.uri, name, mimeType });
    } catch (err) {
      Alert.alert(t('chat.uploadFailedTitle'), err instanceof Error ? err.message : t('chat.uploadFailed'));
    }
  }, []);

  const pickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    const size = asset.size ?? 0;
    if (size > CHAT_ATTACHMENT_MAX_BYTES) {
      Alert.alert(t('chat.uploadFailedTitle'), t('tracking.attachmentTypes'));
      return;
    }

    setPendingAttachment({
      uri: asset.uri,
      name: asset.name ?? 'attachment.pdf',
      mimeType: asset.mimeType ?? 'application/octet-stream',
    });
  }, []);

  const showAttachmentMenu = useCallback(() => {
    const options = [
      t('tracking.takePhoto'),
      t('tracking.uploadGallery'),
      t('tracking.browseFiles'),
      t('common.back'),
    ];
    const cancelIndex = 3;

    const onSelect = (index: number) => {
      if (index === 0) {
        void pickImage('camera');
      } else if (index === 1) {
        void pickImage('gallery');
      } else if (index === 2) {
        void pickDocument();
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex, title: t('chat.attachTitle') },
        onSelect,
      );
      return;
    }

    Alert.alert(t('chat.attachTitle'), undefined, [
      { text: options[0], onPress: () => void pickImage('camera') },
      { text: options[1], onPress: () => void pickImage('gallery') },
      { text: options[2], onPress: () => void pickDocument() },
      { text: options[3], style: 'cancel' },
    ]);
  }, [pickDocument, pickImage]);

  const giftedUser = useMemo(
    () => ({
      _id: currentUserId,
      name: user?.name ?? user?.email,
    }),
    [currentUserId, user?.email, user?.name],
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
        {pendingAttachment ? (
          <View
            className="mt-2 flex-row items-center justify-between rounded-xl px-3 py-2"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
          >
            <Text className="flex-1 text-sm" style={{ color: colors.foreground }} numberOfLines={1}>
              {t('chat.pendingAttachment', { name: pendingAttachment.name })}
            </Text>
            <Pressable onPress={() => setPendingAttachment(null)} hitSlop={8}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('chat.removeAttachment')}</Text>
            </Pressable>
          </View>
        ) : null}
        {(sending || uploading) && (
          <View className="mt-2 flex-row items-center gap-2">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="text-xs" style={{ color: colors.muted }}>
              {uploading ? t('chat.uploading') : t('chat.sending')}
            </Text>
          </View>
        )}
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
                onPress={showAttachmentMenu}
                disabled={sending || uploading}
                accessibilityRole="button"
                accessibilityLabel={t('chat.attachTitle')}
                style={{ padding: 8 }}
              >
                <Paperclip size={22} color={colors.primary} strokeWidth={2} />
              </Pressable>
              <Pressable
                onPress={() => void pickImage('camera')}
                disabled={sending || uploading}
                accessibilityRole="button"
                accessibilityLabel={t('tracking.takePhoto')}
                style={{ padding: 8 }}
              >
                <Camera size={22} color={colors.primary} strokeWidth={2} />
              </Pressable>
            </View>
          )}
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
          imageStyle={{ width: 200, height: 140, borderRadius: 12, margin: 4 }}
          textInputProps={{
            style: { color: colors.foreground, fontSize: 16, lineHeight: 22 },
            placeholderTextColor: colors.muted,
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
