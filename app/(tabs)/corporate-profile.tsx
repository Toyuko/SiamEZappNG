import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Building2, ChevronRight, LogOut, Settings } from 'lucide-react-native';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/use-auth';
import { useCorporateDashboard } from '../../hooks/use-corporate-dashboard';
import { isCorporateRole } from '../../lib/auth/role';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

export default function CorporateProfileTabScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { logout } = useAuth();
  const { userRole, user, accessToken, isGuest } = useAuthStore();
  const isCorporate = isCorporateRole(userRole, user?.role);
  const dashboardQuery = useCorporateDashboard();

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
      return;
    }
    if (userRole && !isCorporate) {
      router.replace(userRole === 'freelancer' ? '/(tabs)/freelancer' : '/(tabs)/dashboard');
    }
  }, [accessToken, isCorporate, isGuest, router, userRole]);

  if (dashboardQuery.isLoading) {
    return <LoadingState label={t('corporate.profile.loading')} />;
  }

  if (dashboardQuery.isError) {
    const error = dashboardQuery.error as unknown;
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('corporate.profile.loadError')}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  const company = dashboardQuery.data?.company;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader title={t('corporate.profile.title')} subtitle={t('corporate.profile.subtitle')} />

        <Card>
          <View className="flex-row items-start gap-3">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Building2 size={26} color="#ffffff" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                {company?.name ?? t('corporate.profile.fallbackName')}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
                {company?.industry} · {company?.location}
              </Text>
              {company?.verified ? (
                <View className="mt-2">
                  <Badge label={t('corporate.verifiedBusiness')} variant="success" />
                </View>
              ) : null}
            </View>
          </View>
        </Card>

        <Card>
          <Pressable
            onPress={() => router.push(`/company/${company?.slug ?? 'demo'}` as never)}
            className="flex-row items-center justify-between py-2"
          >
            <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
              {t('corporate.profile.viewPublic')}
            </Text>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
          <View className="my-2 h-px" style={{ backgroundColor: colors.border }} />
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            className="flex-row items-center justify-between py-2"
          >
            <View className="flex-row items-center gap-2">
              <Settings size={18} color={colors.primary} />
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {t('corporate.profile.accountSettings')}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Pressable>
        </Card>

        <Button
          label={t('corporate.profile.signOut')}
          variant="secondary"
          onPress={() => void logout()}
        >
          <View className="flex-row items-center gap-2">
            <LogOut size={18} color={colors.primary} />
            <Text className="text-base font-semibold" style={{ color: colors.primary }}>
              {t('corporate.profile.signOut')}
            </Text>
          </View>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
