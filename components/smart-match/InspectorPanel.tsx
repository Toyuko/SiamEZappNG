import { ScrollView, Text, View } from 'react-native';

import type { RankedMatch } from '../../features/matching/matching.types';
import { useTheme } from '../../lib/theme/theme';
import { Card } from '../ui/Card';

const KEYS = [
  'jobFit',
  'clientPreference',
  'freelancerPreference',
  'location',
  'availability',
  'price',
  'reputation',
] as const;

export function InspectorPanel({ items, jobTitle }: { items: RankedMatch[]; jobTitle?: string }) {
  const { colors } = useTheme();

  return (
    <Card>
      <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 16 }}>Matching inspector</Text>
      <Text style={{ color: colors.muted, marginTop: 4, marginBottom: 12 }}>
        Demo-only breakdown of hard requirements, preference fit, and the published score mix.
        {jobTitle ? ` Job: ${jobTitle}` : ''}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 8 }}>
            <Head cell="Candidate" width={120} />
            <Head cell="Final" width={48} />
            <Head cell="Gate" width={56} />
            {KEYS.map((key) => (
              <Head key={key} cell={key} width={88} />
            ))}
          </View>
          {items.map((item) => {
            const sameFreelancer = items.every((row) => row.freelancer.id === items[0]?.freelancer.id);
            const label = sameFreelancer ? item.job.title : item.freelancer.name;
            return (
              <View key={`${item.job.id}-${item.freelancer.id}`} style={{ flexDirection: 'row', gap: 12, paddingVertical: 6 }}>
                <Cell text={label} width={120} bold />
                <Cell text={String(item.result.score)} width={48} bold />
                <Cell text={item.result.blocked ? 'BLOCK' : 'OK'} width={56} />
                {KEYS.map((key) => (
                  <Cell key={key} text={String(item.result.breakdown[key])} width={88} />
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
      {items[0] ? (
        <View style={{ marginTop: 16, gap: 6 }}>
          <Text style={{ color: colors.foreground, fontWeight: '800' }}>
            {items[0].freelancer.name} · {items[0].result.score}%
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            Hard requirements: {items[0].result.blocked ? items[0].result.blockReasons.join(' · ') : 'All satisfied'}
          </Text>
          {items[0].result.reasons.slice(0, 4).map((reason) => (
            <Text key={reason} style={{ color: colors.foreground, fontSize: 13 }}>
              • {reason}
            </Text>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function Head({ cell, width }: { cell: string; width: number }) {
  const { colors } = useTheme();
  return (
    <Text style={{ width, color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{cell}</Text>
  );
}

function Cell({ text, width, bold }: { text: string; width: number; bold?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text style={{ width, color: colors.foreground, fontSize: 13, fontWeight: bold ? '800' : '500' }} numberOfLines={1}>
      {text}
    </Text>
  );
}
