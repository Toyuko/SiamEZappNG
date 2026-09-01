import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BadgeCheck, Mail, Share2, Star } from 'lucide-react-native';

import { FreelancerInquirySheet } from '../../components/freelancer/FreelancerInquirySheet';
import { FreelancerSkillChips } from '../../components/freelancer/FreelancerSkillChips';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import type { FreelancerServiceOffering } from '../../features/freelancer/freelancer-profile.types';
import { usePublicFreelancerProfile } from '../../hooks/use-freelancer-directory';
import { appConfig } from '../../lib/config';
import { t } from '../../lib/i18n/i18n';
import { formatJobAmount } from '../../lib/jobs/format-amount';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

function ServiceCard({ service }: { service: FreelancerServiceOffering }) {
  const { colors } = useTheme();
  return (
    <Card>
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
            {service.title}
          </Text>
          {service.description ? (
            <Text className="mt-2 text-sm leading-5" style={{ color: colors.muted }}>
              {service.description}
            </Text>
          ) : null}
        </View>
        {service.price != null ? (
          <Text className="text-base font-bold" style={{ color: colors.primary }}>
            {formatJobAmount(service.price, service.currency ?? 'THB')}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

export function FreelancerProfileDetailScreen({ slug }: { slug: string }) {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const profileQuery = usePublicFreelancerProfile(slug);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  if (profileQuery.isLoading) {
    return <LoadingState label={t('freelancer.publicProfile.detail.loading')} />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    const error = profileQuery.error as unknown;
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('freelancer.publicProfile.detail.loadError')}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data;
  const name = profile.user.name?.trim() || t('freelancer.publicProfile.unnamed');
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const shareUrl = `${appConfig.webBaseUrl}/freelancers/${profile.slug}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('freelancer.publicProfile.detail.shareMessage', { name, url: shareUrl }),
        url: shareUrl,
      });
    } catch {
      // User cancelled.
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['left', 'right', 'top']}>
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            gap: spacing.sectionGap,
            paddingBottom: 120 + insets.bottom,
          }}
        >
          <PageHeader
            title={name}
            subtitle={profile.title ?? undefined}
            onBack={() => router.back()}
            rightSlot={
              <Pressable onPress={() => void handleShare()} hitSlop={10} accessibilityRole="button">
                <Share2 size={20} color="#ffffff" />
              </Pressable>
            }
          />

          <Card>
            <View className="items-center gap-3">
              {profile.user.image ? (
                <Image
                  source={{ uri: profile.user.image }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : (
                <View
                  className="h-24 w-24 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(44, 84, 198, 0.12)' }}
                >
                  <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {initials || '?'}
                  </Text>
                </View>
              )}

              <View className="flex-row flex-wrap items-center justify-center gap-2">
                {profile.verificationStatus === 'verified' ? (
                  <View className="flex-row items-center gap-1">
                    <BadgeCheck size={18} color={colors.primary} />
                    <Badge label={t('freelancer.verified')} variant="success" />
                  </View>
                ) : (
                  <Badge label={t('freelancer.verificationPending')} variant="info" />
                )}
                {profile.isSpecialMember ? (
                  <Badge label={t('freelancer.publicProfile.specialMember')} variant="pending" />
                ) : null}
              </View>

              {profile.averageRating > 0 ? (
                <View className="flex-row items-center gap-1.5">
                  <Star size={16} color={colors.primary} fill={colors.primary} />
                  <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                    {profile.averageRating.toFixed(1)}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    {t('freelancer.publicProfile.detail.reviews', { count: profile.totalReviews })}
                  </Text>
                </View>
              ) : null}

              {profile.hourlyRate != null ? (
                <Text className="text-base font-bold" style={{ color: colors.primary }}>
                  {t('freelancer.publicProfile.fromRate', { amount: formatJobAmount(profile.hourlyRate) })}
                </Text>
              ) : null}

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setInquiryOpen(true)}
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
                  accessibilityLabel={t('freelancer.publicProfile.detail.contact')}
                >
                  <Mail size={18} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          </Card>

          {profile.bio ? (
            <Card>
              <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
                {t('freelancer.publicProfile.detail.about')}
              </Text>
              <Text className="mt-3 text-sm leading-6" style={{ color: colors.foreground }}>
                {profile.bio}
              </Text>
            </Card>
          ) : null}

          {profile.skills.length > 0 ? (
            <Card>
              <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
                {t('freelancer.publicProfile.detail.skills')}
              </Text>
              <View className="mt-3">
                <FreelancerSkillChips skills={profile.skills} />
              </View>
            </Card>
          ) : null}

          <View style={{ gap: spacing.stackMd }}>
            <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
              {t('freelancer.publicProfile.detail.services')}
            </Text>
            {profile.services.length === 0 ? (
              <Text className="text-sm" style={{ color: colors.muted }}>
                {t('freelancer.publicProfile.detail.noServices')}
              </Text>
            ) : (
              profile.services.map((service, index) => (
                <ServiceCard key={`${service.title}-${index}`} service={service} />
              ))
            )}
          </View>
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Button
            label={t('freelancer.publicProfile.detail.contact')}
            onPress={() => setInquiryOpen(true)}
          />
        </View>
      </View>

      <FreelancerInquirySheet
        visible={inquiryOpen}
        slug={profile.slug}
        freelancerName={name}
        onClose={() => setInquiryOpen(false)}
      />
    </SafeAreaView>
  );
}
