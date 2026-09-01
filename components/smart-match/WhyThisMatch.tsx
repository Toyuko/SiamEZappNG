import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { MatchScoreResult } from '../../features/matching/matching.types';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const ROWS: Array<{ key: keyof MatchScoreResult['breakdown']; label: string }> = [
  { key: 'skills', label: 'Skill match' },
  { key: 'location', label: 'Location' },
  { key: 'experience', label: 'Experience' },
  { key: 'availability', label: 'Availability' },
  { key: 'budget', label: 'Budget' },
  { key: 'rating', label: 'Rating' },
  { key: 'language', label: 'Language' },
];

type WhyThisMatchProps = {
  result: MatchScoreResult;
  compact?: boolean;
};

export function WhyThisMatch({ result, compact }: WhyThisMatchProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(!compact);

  return (
    <View style={{ gap: spacing.stackSm }}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel="Why this match?"
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 15 }}>Why this match?</Text>
        <Text style={{ color: siam.blue.DEFAULT, fontWeight: '700' }}>{open ? 'Hide' : 'Show'}</Text>
      </Pressable>
      {result.reasons.map((reason) => (
        <Text key={reason} style={{ color: colors.foreground, fontSize: 13 }}>
          ✓ {reason}
        </Text>
      ))}
      {open ? (
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>{result.summary}</Text>
          {ROWS.map((row) => {
            const value = result.breakdown[row.key];
            return (
              <View key={row.key} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{row.label}</Text>
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>{value}%</Text>
                </View>
                <View style={{ height: 6, borderRadius: 99, backgroundColor: colors.border, overflow: 'hidden' }}>
                  <View
                    style={{
                      width: `${Math.max(4, value)}%`,
                      height: '100%',
                      backgroundColor: value >= 80 ? siam.blue.DEFAULT : siam.yellow.DEFAULT,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
