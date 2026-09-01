import { ScrollView, Text, View } from 'react-native';

import type { RankedMatch } from '../../features/matching/matching.types';
import { useTheme } from '../../lib/theme/theme';
import { Card } from '../ui/Card';

const KEYS = ['skills', 'location', 'experience', 'availability', 'budget', 'rating', 'language'] as const;

export function InspectorPanel({ items, jobTitle }: { items: RankedMatch[]; jobTitle?: string }) {
  const { colors } = useTheme();

  return (
    <Card>
      <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 16 }}>Matching inspector</Text>
      <Text style={{ color: colors.muted, marginTop: 4, marginBottom: 12 }}>
        Demo-only breakdown so you can verify the simulated AI is scoring dynamically.
        {jobTitle ? ` Job: ${jobTitle}` : ''}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 8 }}>
            <Head cell="Freelancer" width={120} />
            <Head cell="Score" width={56} />
            {KEYS.map((key) => (
              <Head key={key} cell={key} width={72} />
            ))}
          </View>
          {items.map((item) => {
            const sameFreelancer = items.every((row) => row.freelancer.id === items[0]?.freelancer.id);
            const label = sameFreelancer ? item.job.title : item.freelancer.name;
            return (
              <View key={`${item.job.id}-${item.freelancer.id}`} style={{ flexDirection: 'row', gap: 12, paddingVertical: 6 }}>
                <Cell text={label} width={120} bold />
                <Cell text={String(item.result.score)} width={56} bold />
                {KEYS.map((key) => (
                  <Cell key={key} text={String(item.result.breakdown[key])} width={72} />
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
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
