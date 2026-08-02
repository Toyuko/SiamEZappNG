import { useQuery } from '@tanstack/react-query';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { MetricCard } from '../../components/ui/metric-card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import {
  fetchSellerAnalytics,
  fetchSellerEnquiries,
} from '../../features/seller/seller.api';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function SellerScreen() {
  const { colors } = useTheme();
  const analyticsQuery = useQuery({
    queryKey: ['seller-analytics'],
    queryFn: () => fetchSellerAnalytics(12),
  });
  const enquiriesQuery = useQuery({
    queryKey: ['seller-enquiries'],
    queryFn: fetchSellerEnquiries,
  });

  if (analyticsQuery.isLoading || enquiriesQuery.isLoading) {
    return <LoadingState label="Loading seller hub…" />;
  }

  if (analyticsQuery.isError) {
    return (
      <ErrorState
        label={
          analyticsQuery.error instanceof Error
            ? analyticsQuery.error.message
            : 'Unable to load seller analytics'
        }
        onRetry={() => void analyticsQuery.refetch()}
      />
    );
  }

  const stats = analyticsQuery.data;
  const enquiries = enquiriesQuery.data ?? [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: spacing.sectionGap,
          paddingBottom: 40,
        }}
      >
        <PageHeader
          title="Seller hub"
          subtitle="Views and enquiries synced with Platform 2.1."
        />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[46%] flex-1">
            <MetricCard title="Listings" value={stats?.listingCount ?? 0} />
          </View>
          <View className="min-w-[46%] flex-1">
            <MetricCard title="Views" value={stats?.totalViews ?? 0} />
          </View>
          <View className="min-w-[46%] flex-1">
            <MetricCard title="Enquiries" value={stats?.totalEnquiries ?? 0} />
          </View>
        </View>

        <Section title="Listing performance">
          {(stats?.rows ?? []).length === 0 ? (
            <Card>
              <Text className="text-sm" style={{ color: colors.muted }}>
                No owned listings yet. Create inventory on the website seller portal.
              </Text>
            </Card>
          ) : (
            (stats?.rows ?? []).map((row) => (
              <Card key={`${row.listingType}-${row.listingId}`}>
                <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                  {row.title}
                </Text>
                <Text className="mt-1 text-xs" style={{ color: colors.muted }}>
                  {row.viewCount} views · {row.enquiryCount} enquiries · {row.listingType}
                </Text>
              </Card>
            ))
          )}
        </Section>

        <Section title="Enquiry inbox">
          {enquiries.length === 0 ? (
            <Card>
              <Text className="text-sm" style={{ color: colors.muted }}>
                No enquiries yet.
              </Text>
            </Card>
          ) : (
            enquiries.map((item) => (
              <Card key={item.id}>
                <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                  {item.listingTitle ?? item.listingId}
                </Text>
                <Text className="mt-1 text-xs" style={{ color: colors.muted }}>
                  {item.name} · {item.email}
                </Text>
                <Text className="mt-2 text-sm leading-5" style={{ color: colors.foreground }}>
                  {item.message}
                </Text>
              </Card>
            ))
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
