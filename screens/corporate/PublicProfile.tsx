import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Pressable,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BadgeCheck, Share2 } from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import type { CorporateJobPosting } from '../../features/corporate/corporate.types';
import { usePublicCompanyProfile } from '../../hooks/use-public-company-profile';
import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

const BANNER_MAX = 220;
const BANNER_MIN = 120;

type ProfileTab = 'about' | 'openings';

function JobOpeningCard({ job }: { job: CorporateJobPosting }) {
  const { colors } = useTheme();
  return (
    <Card>
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
            {job.title}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
            ฿{job.budget.toLocaleString()} · {job.location ?? t('corporate.public.locationFallback')}
          </Text>
        </View>
        <Badge label={job.status.replace('_', ' ')} variant="info" />
      </View>
      <Text className="mt-3 text-sm leading-5" style={{ color: colors.muted }} numberOfLines={3}>
        {job.description}
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-1.5">
        {job.skills.map((skill) => (
          <View
            key={skill}
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: 'rgba(44, 84, 198, 0.1)' }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
              {skill}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function CorporatePublicProfileScreen({ companyIdOrSlug }: { companyIdOrSlug: string }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { userRole, user } = useAuthStore();
  const profileQuery = usePublicCompanyProfile(companyIdOrSlug);
  const [tab, setTab] = useState<ProfileTab>('about');
  const scrollY = useRef(new Animated.Value(0)).current;

  const isFreelancer =
    userRole === 'freelancer' || user?.role === 'freelancer' || user?.role === 'FREELANCER';

  const bannerHeight = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [BANNER_MAX, BANNER_MIN],
    extrapolate: 'clamp',
  });

  const logoScale = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0.78],
    extrapolate: 'clamp',
  });

  const company = profileQuery.data;
  const openJobs = useMemo(() => company?.openJobs ?? [], [company?.openJobs]);

  const handleShare = async () => {
    if (!company) {
      return;
    }
    try {
      await Share.share({
        message: t('corporate.public.shareMessage', {
          name: company.name,
          slug: company.slug,
        }),
      });
    } catch {
      // User cancelled share sheet.
    }
  };

  const handleApply = () => {
    if (!isFreelancer) {
      Alert.alert(t('corporate.public.applyGuestTitle'), t('corporate.public.applyGuestMessage'));
      router.push('/(auth)/login');
      return;
    }
    Alert.alert(t('corporate.public.applyTitle'), t('corporate.public.applyMessage'));
    router.push('/(tabs)/freelancer');
  };

  if (profileQuery.isLoading) {
    return <LoadingState label={t('corporate.public.loading')} />;
  }

  if (profileQuery.isError || !company) {
    const error = profileQuery.error as unknown;
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('corporate.public.loadError')}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['left', 'right', 'bottom']}>
      <View className="flex-1">
        <Animated.View style={{ height: bannerHeight, overflow: 'hidden' }}>
          {company.bannerUrl ? (
            <Image source={{ uri: company.bannerUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, backgroundColor: siam.blue.DEFAULT }} />
          )}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 90,
              backgroundColor: 'rgba(15, 23, 42, 0.35)',
            }}
          />
          <View className="absolute bottom-4 left-4 right-4 flex-row items-end justify-between">
            <View className="flex-row items-end gap-3">
              <Animated.View
                style={{
                  transform: [{ scale: logoScale }],
                  width: 72,
                  height: 72,
                  borderRadius: radius.lg,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: '#ffffff',
                  backgroundColor: colors.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {company.logoUrl ? (
                  <Image source={{ uri: company.logoUrl }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text className="text-xl font-bold" style={{ color: siam.blue.DEFAULT }}>
                    {company.name.slice(0, 2).toUpperCase()}
                  </Text>
                )}
              </Animated.View>
              <View className="mb-1">
                <Text className="text-xl font-bold" style={{ color: '#ffffff' }}>
                  {company.name}
                </Text>
                {company.verified ? (
                  <View className="mt-1 flex-row items-center gap-1">
                    <BadgeCheck size={16} color={siam.yellow.DEFAULT} />
                    <Text className="text-xs font-semibold" style={{ color: siam.yellow.DEFAULT }}>
                      {t('corporate.verifiedBusiness')}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Pressable
              onPress={() => void handleShare()}
              accessibilityRole="button"
              accessibilityLabel={t('corporate.public.share')}
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
            >
              <Share2 size={18} color={siam.blue.DEFAULT} />
            </Pressable>
          </View>
        </Animated.View>

        <View className="flex-row border-b px-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
          {(['about', 'openings'] as ProfileTab[]).map((key) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                className="flex-1 items-center py-3"
                style={{ borderBottomWidth: 2, borderBottomColor: active ? colors.primary : 'transparent' }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: active ? colors.primary : colors.muted }}
                >
                  {key === 'about' ? t('corporate.public.tabAbout') : t('corporate.public.tabOpenings')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Animated.ScrollView
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          contentContainerStyle={{
            padding: 16,
            gap: spacing.stackMd,
            paddingBottom: isFreelancer ? 110 : 40,
          }}
        >
          {tab === 'about' ? (
            <>
              <Card>
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  {t('corporate.public.aboutTitle')}
                </Text>
                <Text className="mt-2 text-sm leading-6" style={{ color: colors.muted }}>
                  {company.description}
                </Text>
              </Card>
              <Card>
                <Text className="text-sm font-medium" style={{ color: colors.muted }}>
                  {t('corporate.public.industry')}
                </Text>
                <Text className="mt-1 text-base font-semibold" style={{ color: colors.foreground }}>
                  {company.industry}
                </Text>
                <Text className="mt-4 text-sm font-medium" style={{ color: colors.muted }}>
                  {t('corporate.public.location')}
                </Text>
                <Text className="mt-1 text-base font-semibold" style={{ color: colors.foreground }}>
                  {company.location}
                </Text>
              </Card>
            </>
          ) : openJobs.length === 0 ? (
            <EmptyState label={t('corporate.public.noOpenings')} />
          ) : (
            openJobs.map((job) => <JobOpeningCard key={job.id} job={job} />)
          )}
        </Animated.ScrollView>

        {isFreelancer && tab === 'openings' ? (
          <View
            className="absolute bottom-0 left-0 right-0 border-t px-4 pb-6 pt-3"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Button label={t('corporate.public.applyNow')} gradient onPress={handleApply} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
