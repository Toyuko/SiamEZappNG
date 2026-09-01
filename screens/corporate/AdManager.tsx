import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import { useUploadAdCampaign } from '../../hooks/use-corporate-ads';
import { useCorporateDashboard } from '../../hooks/use-corporate-dashboard';
import { isCorporateRole } from '../../lib/auth/role';
import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { TRACKING_IMAGE_PICKER_OPTIONS } from '../../lib/uploads/tracking-image';
import { useAuthStore } from '../../store/auth-store';

type BannerAsset = {
  uri: string;
  name: string;
  mimeType: string;
};

function BudgetProgressBar({ spent, total }: { spent: number; total: number }) {
  const { colors } = useTheme();
  const ratio = total > 0 ? Math.min(1, Math.max(0, spent / total)) : 0;
  const remaining = Math.max(0, total - spent);

  return (
    <Card>
      <Text className="text-sm font-medium" style={{ color: colors.muted }}>
        {t('corporate.ads.budgetProgress')}
      </Text>
      <View className="mt-3 h-3 overflow-hidden rounded-full" style={{ backgroundColor: colors.border }}>
        <View
          className="h-full rounded-full"
          style={{ width: `${ratio * 100}%`, backgroundColor: siam.blue.DEFAULT }}
        />
      </View>
      <View className="mt-3 flex-row justify-between">
        <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
          {t('corporate.ads.spent', { amount: spent.toLocaleString() })}
        </Text>
        <Text className="text-sm font-semibold" style={{ color: colors.muted }}>
          {t('corporate.ads.remaining', { amount: remaining.toLocaleString() })}
        </Text>
      </View>
    </Card>
  );
}

export function CorporateAdManagerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userRole, user, accessToken, isGuest } = useAuthStore();
  const isCorporate = isCorporateRole(userRole, user?.role);
  const dashboardQuery = useCorporateDashboard();
  const uploadMutation = useUploadAdCampaign();

  const activeCampaign = dashboardQuery.data?.activeCampaign;
  const [targetUrl, setTargetUrl] = useState(activeCampaign?.targetUrl ?? '');
  const [totalBudget, setTotalBudget] = useState(String(activeCampaign?.totalBudget ?? 10000));
  const [dailyLimit, setDailyLimit] = useState(String(activeCampaign?.dailyLimit ?? 1000));
  const [banner, setBanner] = useState<BannerAsset | null>(null);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
      return;
    }
    if (userRole && !isCorporate) {
      router.replace(userRole === 'freelancer' ? '/(tabs)/freelancer' : '/(tabs)/dashboard');
    }
  }, [accessToken, isCorporate, isGuest, router, userRole]);

  useEffect(() => {
    if (!activeCampaign) {
      return;
    }
    setTargetUrl((prev) => prev || activeCampaign.targetUrl);
    setTotalBudget((prev) => prev || String(activeCampaign.totalBudget));
    setDailyLimit((prev) => prev || String(activeCampaign.dailyLimit));
  }, [activeCampaign]);

  const previewUri = useMemo(
    () => banner?.uri ?? activeCampaign?.bannerUrl ?? null,
    [activeCampaign?.bannerUrl, banner?.uri],
  );

  const pickBanner = async () => {
    const permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert(t('corporate.ads.permissionTitle'), t('corporate.ads.permissionMessage'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      ...TRACKING_IMAGE_PICKER_OPTIONS,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }
    const asset = result.assets[0];
    setBanner({
      uri: asset.uri,
      name: asset.fileName ?? `banner-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
  };

  const handleLaunch = async () => {
    const budget = Number(totalBudget);
    const daily = Number(dailyLimit);
    if (!targetUrl.trim() || !Number.isFinite(budget) || budget <= 0 || !Number.isFinite(daily) || daily <= 0) {
      Alert.alert(t('corporate.ads.formIncompleteTitle'), t('corporate.ads.formIncompleteMessage'));
      return;
    }
    try {
      await uploadMutation.mutateAsync({
        targetUrl: targetUrl.trim(),
        totalBudget: budget,
        dailyLimit: daily,
        bannerUri: banner?.uri,
        bannerName: banner?.name,
        bannerMimeType: banner?.mimeType,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('corporate.ads.launchSuccessTitle'), t('corporate.ads.launchSuccessMessage'));
    } catch (error) {
      Alert.alert(
        t('corporate.ads.launchErrorTitle'),
        error instanceof Error ? error.message : t('corporate.ads.launchErrorMessage'),
      );
    }
  };

  if (dashboardQuery.isLoading) {
    return <LoadingState label={t('corporate.ads.loading')} />;
  }

  if (dashboardQuery.isError) {
    const error = dashboardQuery.error as unknown;
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('corporate.ads.loadError')}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 40 }}>
        <PageHeader title={t('corporate.ads.title')} subtitle={t('corporate.ads.subtitle')} />

        {activeCampaign ? (
          <BudgetProgressBar spent={activeCampaign.spent} total={activeCampaign.totalBudget} />
        ) : null}

        <Section title={t('corporate.ads.setup')} subtitle={t('corporate.ads.setupSubtitle')}>
          <Card>
            <View className="gap-4">
              <View>
                <Text className="mb-2 text-sm font-medium" style={{ color: colors.foreground }}>
                  {t('corporate.ads.banner')}
                </Text>
                {previewUri ? (
                  <Image
                    source={{ uri: previewUri }}
                    style={{ width: '100%', height: 160, borderRadius: radius.lg, marginBottom: 12 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="mb-3 items-center justify-center"
                    style={{
                      height: 140,
                      borderRadius: radius.lg,
                      borderWidth: 1,
                      borderStyle: 'dashed',
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    }}
                  >
                    <Text style={{ color: colors.muted }}>{t('corporate.ads.bannerEmpty')}</Text>
                  </View>
                )}
                <Button label={t('corporate.ads.pickBanner')} variant="secondary" onPress={() => void pickBanner()} />
              </View>

              <Input
                label={t('corporate.ads.targetUrl')}
                value={targetUrl}
                onChangeText={setTargetUrl}
                autoCapitalize="none"
                keyboardType="url"
                placeholder="https://"
              />
              <Input
                label={t('corporate.ads.totalBudget')}
                value={totalBudget}
                onChangeText={setTotalBudget}
                keyboardType="numeric"
                placeholder="10000"
              />
              <Input
                label={t('corporate.ads.dailyLimit')}
                value={dailyLimit}
                onChangeText={setDailyLimit}
                keyboardType="numeric"
                placeholder="1000"
              />

              <Button
                label={uploadMutation.isPending ? t('corporate.ads.launching') : t('corporate.ads.launch')}
                gradient
                disabled={uploadMutation.isPending}
                onPress={() => void handleLaunch()}
              />
            </View>
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
