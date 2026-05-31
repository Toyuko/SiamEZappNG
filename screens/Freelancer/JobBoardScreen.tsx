import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Briefcase, Building2, ChevronRight, Sparkles, X } from 'lucide-react-native';

import { JobPreviewModal } from '../../components/JobPreviewModal';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/empty-state';
import { getOpenJobs } from '../../features/jobs/jobs.api';
import { useAcceptFreelancerJob } from '../../hooks/use-accept-freelancer-job';
import { feedPayoutAmount } from '../../lib/jobs/job-board-mapper';
import { t } from '../../lib/i18n/i18n';
import { formatJobAmount } from '../../lib/jobs/format-amount';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { subscribeToJobBoard } from '../../services/pusherService';
import type { JobBoardFeedItem } from '../../types/job-board';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HIGHLIGHT_MS = 2000;
const TOAST_MS = 4500;

type JobToast = {
  id: string;
  message: string;
};

type JobBoardScreenProps = {
  /** Disable FlatList scrolling when nested inside a parent ScrollView. */
  nestedInScrollView?: boolean;
  isSpecialMember?: boolean;
};

function JobBoardToast({ toast, onDismiss }: { toast: JobToast; onDismiss: () => void }) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(91, 118, 224, 0.4)' : 'rgba(44, 84, 198, 0.3)',
        backgroundColor: colors.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Sparkles size={16} color={colors.primary} strokeWidth={2} style={{ marginTop: 2 }} />
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.foreground }}>
        {toast.message}
      </Text>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={t('freelancer.dismissNotification')}
        hitSlop={8}
      >
        <X size={16} color={colors.muted} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

function JobBoardCard({
  job,
  highlighted,
  onPress,
}: {
  job: JobBoardFeedItem;
  highlighted: boolean;
  onPress: () => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${job.title}. ${t('freelancer.jobPreview.tapToPreview')}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          borderRadius: 12,
          borderWidth: highlighted ? 2 : 1,
          borderColor: highlighted
            ? isDark
              ? siam.blue.bright
              : siam.blue.DEFAULT
            : colors.border,
          backgroundColor: highlighted
            ? isDark
              ? 'rgba(91, 118, 224, 0.2)'
              : 'rgba(44, 84, 198, 0.12)'
            : colors.background,
          padding: spacing.cardPaddingCompact,
          gap: spacing.stackSm,
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <Text className="font-semibold" style={{ color: colors.foreground, flex: 1 }}>
            {job.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {job.isSpecialMemberOnly ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  borderRadius: 999,
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FEF3C7',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Sparkles size={12} color={isDark ? '#FCD34D' : '#B45309'} strokeWidth={2} />
                <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#FCD34D' : '#92400E' }}>
                  {t('freelancer.specialMemberOnly')}
                </Text>
              </View>
            ) : null}
            <ChevronRight size={18} color={colors.muted} strokeWidth={2} />
          </View>
        </View>

        {job.category ? (
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: colors.primary,
            }}
          >
            {job.category}
          </Text>
        ) : null}

        <Text className="text-sm leading-5" style={{ color: colors.muted }} numberOfLines={2}>
          {job.description}
        </Text>

        <View className="flex-row flex-wrap items-center justify-between gap-2">
          {job.service ? (
            <View className="flex-row items-center gap-1">
              <Building2 size={14} color={colors.muted} strokeWidth={2} />
              <Text className="text-xs" style={{ color: colors.muted }}>
                {job.service.name}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
            {formatJobAmount(feedPayoutAmount(job), job.currency)}
          </Text>
        </View>

        <Text className="text-xs" style={{ color: colors.muted }}>
          {t('freelancer.jobPreview.tapToPreview')}
        </Text>
      </View>
    </Pressable>
  );
}

export function JobBoardScreen({ nestedInScrollView = false, isSpecialMember = false }: JobBoardScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const isFocused = useIsFocused();
  const acceptMutation = useAcceptFreelancerJob();
  const [jobs, setJobs] = useState<JobBoardFeedItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobBoardFeedItem | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<JobToast[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const highlightTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const toastIdRef = useRef(0);

  const markHighlighted = useCallback((jobId: string) => {
    setHighlightedIds((prev) => new Set(prev).add(jobId));

    const existing = highlightTimers.current.get(jobId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      setHighlightedIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      highlightTimers.current.delete(jobId);
    }, HIGHLIGHT_MS);

    highlightTimers.current.set(jobId, timer);
  }, []);

  const pushToast = useCallback((message: string) => {
    const id = `toast-${++toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_MS);
  }, []);

  const prependJob = useCallback(
    (job: JobBoardFeedItem, showToast: boolean) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setJobs((prev) => {
        if (prev.some((item) => item.id === job.id)) return prev;
        return [job, ...prev];
      });
      markHighlighted(job.id);
      if (showToast) {
        const category = job.category ?? job.title;
        pushToast(t('freelancer.newJobToast', { category }));
      }
    },
    [markHighlighted, pushToast],
  );

  const handleNewJob = useCallback(
    (job: JobBoardFeedItem) => {
      prependJob(job, isFocused);
    },
    [isFocused, prependJob],
  );

  const closePreview = useCallback(() => {
    if (isAccepting) return;
    setSelectedJob(null);
  }, [isAccepting]);

  const handleAcceptJob = useCallback(async () => {
    if (!selectedJob || isAccepting) return;

    const jobId = selectedJob.id;
    setIsAccepting(true);
    try {
      await acceptMutation.mutateAsync(jobId);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      setSelectedJob(null);
      router.push(`/freelancer/tracking/${jobId}`);
    } catch (error) {
      Alert.alert(
        t('freelancer.acceptErrorTitle'),
        error instanceof Error ? error.message : t('freelancer.acceptErrorMessage'),
      );
    } finally {
      setIsAccepting(false);
    }
  }, [acceptMutation, isAccepting, router, selectedJob]);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const fetched = await getOpenJobs();
        if (cancelled) return;
        setJobs(
          [...fetched].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : t('freelancer.jobFeedLoadError'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadJobs();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const subscription = subscribeToJobBoard(handleNewJob, { isSpecialMember });
    return () => {
      subscription?.unsubscribe();
    };
  }, [handleNewJob, isSpecialMember]);

  useEffect(() => {
    return () => {
      highlightTimers.current.forEach((timer) => clearTimeout(timer));
      highlightTimers.current.clear();
    };
  }, []);

  return (
    <View style={{ position: 'relative' }}>
      {toasts.length > 0 ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            gap: 8,
            paddingBottom: 8,
          }}
        >
          {toasts.map((toast) => (
            <JobBoardToast
              key={toast.id}
              toast={toast}
              onDismiss={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
            />
          ))}
        </View>
      ) : null}

      <Card>
        <View className="flex-row items-center gap-2 border-b pb-3" style={{ borderColor: colors.border }}>
          <Briefcase size={20} color={colors.primary} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text className="text-base font-semibold" style={{ color: colors.primary }}>
              {t('freelancer.jobFeed')}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('freelancer.jobFeedSubtitle')}
            </Text>
          </View>
        </View>

        {loadError ? (
          <Text className="text-sm" style={{ color: '#D97706', marginTop: spacing.stackMd }}>
            {loadError}
          </Text>
        ) : null}

        {isLoading ? (
          <View style={{ marginTop: spacing.stackMd, minHeight: 80, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            scrollEnabled={!nestedInScrollView}
            nestedScrollEnabled={nestedInScrollView}
            style={{ marginTop: spacing.stackMd }}
            contentContainerStyle={{ gap: spacing.stackMd, paddingBottom: 4 }}
            ListEmptyComponent={<EmptyState label={t('freelancer.noOpenJobs')} />}
            renderItem={({ item }) => (
              <JobBoardCard
                job={item}
                highlighted={highlightedIds.has(item.id)}
                onPress={() => setSelectedJob(item)}
              />
            )}
          />
        )}
      </Card>

      <JobPreviewModal
        visible={selectedJob !== null}
        job={selectedJob}
        accepting={isAccepting}
        onClose={closePreview}
        onAccept={() => void handleAcceptJob()}
      />
    </View>
  );
}
