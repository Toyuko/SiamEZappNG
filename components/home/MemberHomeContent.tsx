import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { ClientCase } from '../../features/cases/cases.types';
import { getServiceTitle } from '../../features/services/service-display';
import { serviceCatalog } from '../../features/services/services.data';
import { useBookingDrafts } from '../../hooks/use-booking-drafts';
import { useCases } from '../../hooks/use-cases';
import { useDocuments } from '../../hooks/use-documents';
import { useSoftLaunch } from '../../hooks/use-soft-launch';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FadeInView } from '../ui/FadeInView';
import { PageHeader } from '../ui/PageHeader';
import { Section } from '../ui/Section';
import { StatusBadge } from '../ui/status-badge';

type QuickAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { key: 'services', label: 'tabs.services', icon: 'grid-outline', href: '/(tabs)/services' },
  { key: 'book', label: 'tabs.book', icon: 'calendar-outline', href: '/(tabs)/book' },
  { key: 'cases', label: 'tabs.cases', icon: 'briefcase-outline', href: '/(tabs)/cases' },
  { key: 'documents', label: 'tabs.documents', icon: 'document-text-outline', href: '/(tabs)/documents' },
  { key: 'smart-match', label: 'Smart Match', icon: 'sparkles-outline', href: '/smart-match' },
  { key: 'sales', label: 'tabs.sales', icon: 'car-outline', href: '/(tabs)/sales' },
  { key: 'real-estate', label: 'tabs.realEstate', icon: 'home-outline', href: '/(tabs)/real-estate' },
  { key: 'concierge', label: 'tabs.more', icon: 'chatbubbles-outline', href: '/(tabs)/concierge' },
];

const SOFT_LAUNCH_QUICK_KEYS = new Set(['services', 'sales', 'real-estate', 'cases', 'documents', 'concierge', 'smart-match']);

function firstName(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.includes('@')) {
    return trimmed.split('@')[0] ?? trimmed;
  }
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function CaseRow({ item }: { item: ClientCase }) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Card>
      <Pressable onPress={() => router.push(`/cases/${item.id}`)} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
        <Text className="text-base font-bold" style={{ color: colors.foreground }}>
          {item.title}
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
          {item.serviceType}
        </Text>
        <View className="mt-3 flex-row items-center justify-between">
          <StatusBadge status={item.status} />
          <Text className="text-xs" style={{ color: colors.muted }}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </Pressable>
    </Card>
  );
}

export function MemberHomeContent() {
  const router = useRouter();
  const softLaunch = useSoftLaunch();
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const user = useAuthStore((state) => state.user);
  const casesQuery = useCases();
  const documentsQuery = useDocuments();
  const { drafts } = useBookingDrafts(true);
  const quickActions = softLaunch.enabled
    ? QUICK_ACTIONS.filter((action) => {
        if (SOFT_LAUNCH_QUICK_KEYS.has(action.key)) return true;
        return action.key === 'freelancers' && softLaunch.showFreelancers;
      })
    : QUICK_ACTIONS.filter((action) => action.key !== 'real-estate' && action.key !== 'concierge');

  const displayName = user?.name?.trim() || user?.email || t('common.unknownUser');
  const greetingName = firstName(String(displayName));

  const cases = useMemo(() => {
    const list = casesQuery.data ?? [];
    return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [casesQuery.data]);

  const recentCases = cases.slice(0, 3);
  const waitingCases = cases.filter((item) => item.status === 'WAITING_CLIENT').slice(0, 3);
  const pendingDocs = (documentsQuery.data ?? []).filter((doc) => doc.status === 'PENDING').length;

  const draftItems = useMemo(() => {
    return drafts
      .map((draft) => {
        const service = serviceCatalog.find((item) => item.slug === draft.slug);
        return {
          slug: draft.slug,
          title: service ? getServiceTitle(service, language) : draft.slug,
        };
      })
      .slice(0, 2);
  }, [drafts, language]);

  const hasAttention = waitingCases.length > 0 || pendingDocs > 0 || draftItems.length > 0;

  return (
    <>
      <FadeInView delay={0} distance={18}>
        <PageHeader
          badge={t('home.hub.badge')}
          title={t('home.hub.greeting', { name: greetingName })}
          subtitle={t('home.hub.subtitle')}
          primaryCta={{ label: t('home.browseServices'), onPress: () => router.push('/(tabs)/services') }}
          secondaryCta={
            softLaunch.enabled
              ? { label: 'Ask SiamEZ', onPress: () => router.push('/(tabs)/concierge') }
              : { label: t('cta.bookNow'), onPress: () => router.push('/(tabs)/book') }
          }
        />
      </FadeInView>

      {hasAttention ? (
        <Section title={t('home.hub.needsAttention')} subtitle={t('home.hub.needsAttentionSubtitle')}>
          {waitingCases.map((item) => (
            <CaseRow key={`wait-${item.id}`} item={item} />
          ))}

          {pendingDocs > 0 ? (
            <Card>
              <Pressable
                onPress={() => router.push('/(tabs)/documents')}
                style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                      {t('home.hub.pendingDocuments', { count: pendingDocs })}
                    </Text>
                    <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
                      {t('home.hub.pendingDocumentsHint')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </View>
              </Pressable>
            </Card>
          ) : null}

          {draftItems.map((draft) => (
            <Card key={draft.slug}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/(tabs)/book', params: { serviceSlug: draft.slug } })
                }
                style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="create-outline" size={22} color={colors.primary} />
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                      {t('home.hub.resumeBooking')}
                    </Text>
                    <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
                      {draft.title}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </View>
              </Pressable>
            </Card>
          ))}
        </Section>
      ) : null}

      <Section
        title={t('home.hub.recentCases')}
        subtitle={
          casesQuery.isLoading
            ? t('cases.loading')
            : recentCases.length > 0
              ? t('home.hub.recentCasesSubtitle')
              : t('home.hub.noCasesSubtitle')
        }
      >
        {casesQuery.isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : recentCases.length > 0 ? (
          <>
            {recentCases.map((item) => (
              <CaseRow key={item.id} item={item} />
            ))}
            <Button label={t('home.hub.viewAllCases')} variant="secondary" onPress={() => router.push('/(tabs)/cases')} />
          </>
        ) : (
          <Card>
            <Text className="text-sm leading-5" style={{ color: colors.muted }}>
              {t('home.hub.emptyCases')}
            </Text>
            <View className="mt-4">
              <Button label={t('cta.bookNow')} gradient onPress={() => router.push('/(tabs)/book')} />
            </View>
          </Card>
        )}
      </Section>

      <Section title={t('home.hub.shortcuts')} subtitle={t('home.hub.shortcutsSubtitle')}>
        <View className="flex-row flex-wrap" style={{ gap: 10 }}>
          {quickActions.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => router.push(action.href as never)}
              accessibilityRole="button"
              accessibilityLabel={
                action.key === 'concierge' ? 'Ask SiamEZ' : action.key === 'smart-match' ? 'SiamEZ Smart Match' : t(action.label)
              }
              className="items-center justify-center"
              style={({ pressed }) => ({
                width: '31%',
                flexGrow: 1,
                minWidth: 96,
                paddingVertical: 14,
                paddingHorizontal: 8,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name={action.icon} size={22} color={colors.primary} />
              <Text
                className="mt-2 text-center text-xs font-semibold"
                numberOfLines={2}
                style={{ color: colors.foreground }}
              >
                {action.key === 'concierge' ? 'Ask SiamEZ' : action.key === 'smart-match' ? 'Smart Match' : t(action.label)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>
    </>
  );
}
