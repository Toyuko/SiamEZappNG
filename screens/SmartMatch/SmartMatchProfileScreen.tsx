import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarPhoto } from '../../components/smart-match/AvatarPhoto';
import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { WhyThisMatch } from '../../components/smart-match/WhyThisMatch';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { CATEGORY_LABELS } from '../../features/matching/matching.constants';
import { calculateMatchScore, formatRate } from '../../features/matching/matching.scoring';
import { findFreelancer } from '../../features/matching/matching.service';
import { useMatchingStore } from '../../features/matching/matching.store';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function SmartMatchProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const freelancer = findFreelancer(String(id));
  const job = useMatchingStore((s) => s.jobs.find((item) => item.id === s.currentJobId) ?? null);
  const likeCurrentFreelancer = useMatchingStore((s) => s.likeCurrentFreelancer);
  const passCurrentFreelancer = useMatchingStore((s) => s.passCurrentFreelancer);
  const saveProfile = useMatchingStore((s) => s.saveProfile);

  if (!freelancer) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16, gap: 12 }}>
          <PageHeader title="Profile" subtitle="Professional not found." onBack={() => router.back()} />
          <Button label="Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const result = job ? calculateMatchScore(job, freelancer) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.stackLg, paddingBottom: 40 }}>
        <PageHeader title={freelancer.name} subtitle={CATEGORY_LABELS[freelancer.category]} onBack={() => router.back()} />
        <DemoModeBanner />
        <Card>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <AvatarPhoto uri={freelancer.profilePhoto} name={freelancer.name} width={160} height={160} borderRadius={24} />
            {freelancer.verified ? <Badge label="Verified" variant="success" /> : null}
            <Text style={{ color: colors.muted }}>{freelancer.location} · {freelancer.yearsExperience} yrs</Text>
            <Text style={{ color: colors.foreground, fontWeight: '800' }}>
              ★ {freelancer.rating.toFixed(1)} · {freelancer.completedJobs} jobs · {formatRate(freelancer)}
            </Text>
          </View>
          <Text style={{ color: colors.foreground, marginTop: 16, lineHeight: 22 }}>{freelancer.bio}</Text>
        </Card>

        {result ? (
          <Card>
            <WhyThisMatch result={result} />
          </Card>
        ) : null}

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800' }}>Skills</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>{freelancer.skills.join(' · ')}</Text>
          <Text style={{ color: colors.foreground, fontWeight: '800', marginTop: 14 }}>Languages</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>{freelancer.languages.join(', ')}</Text>
          <Text style={{ color: colors.foreground, fontWeight: '800', marginTop: 14 }}>Certifications</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>
            {freelancer.certifications.length ? freelancer.certifications.join(' · ') : 'None listed'}
          </Text>
          <Text style={{ color: colors.foreground, fontWeight: '800', marginTop: 14 }}>Availability</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>
            {freelancer.availability.replace('_', ' ')} · {freelancer.responseTime} · {freelancer.responseRate}% response rate
          </Text>
        </Card>

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800' }}>Reviews</Text>
          {freelancer.reviews.map((review) => (
            <View key={review.id} style={{ marginTop: 12 }}>
              <Text style={{ color: colors.foreground, fontWeight: '700' }}>
                {review.author} · ★ {review.rating}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>{review.text}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={{ color: colors.foreground, fontWeight: '800' }}>Portfolio</Text>
          {freelancer.portfolio.map((item) => (
            <View key={item.id} style={{ marginTop: 12 }}>
              <Text style={{ color: colors.foreground, fontWeight: '700' }}>{item.title}</Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>{item.description}</Text>
            </View>
          ))}
        </Card>

        <Button
          label="Like"
          onPress={() => {
            likeCurrentFreelancer(freelancer.id);
            router.back();
          }}
          gradient
        />
        <Button
          label="Pass"
          variant="secondary"
          onPress={() => {
            passCurrentFreelancer(freelancer.id);
            router.back();
          }}
        />
        <Button
          label="Message / save"
          variant="secondary"
          onPress={() => {
            saveProfile(freelancer.id);
            likeCurrentFreelancer(freelancer.id);
            router.back();
          }}
        />
        <Button
          label="Book"
          variant="accent"
          gradient
          onPress={() => {
            likeCurrentFreelancer(freelancer.id);
            router.back();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
