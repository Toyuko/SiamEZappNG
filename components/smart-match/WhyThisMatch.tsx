import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { MatchScoreResult } from '../../features/matching/matching.types';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const COMPOSITE: Array<{ key: keyof MatchScoreResult['breakdown']; label: string }> = [
  { key: 'jobFit', label: 'Job requirements' },
  { key: 'clientPreference', label: 'Client preferences' },
  { key: 'freelancerPreference', label: 'Freelancer preferences' },
  { key: 'location', label: 'Location' },
  { key: 'availability', label: 'Availability' },
  { key: 'price', label: 'Price' },
  { key: 'reputation', label: 'Reputation' },
];

function stars(score: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(score / 20)));
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
}

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
        <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 15 }}>
          {result.blocked ? 'Why this was blocked' : 'Why this match?'}
        </Text>
        <Text style={{ color: siam.blue.DEFAULT, fontWeight: '700' }}>{open ? 'Hide' : 'Show'}</Text>
      </Pressable>
      <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 22 }}>
        {result.blocked ? `Blocked · ${result.score}%` : `${result.score}% MATCH`}
      </Text>
      {(result.blocked ? result.blockReasons : result.reasons).map((reason) => (
        <Text key={reason} style={{ color: colors.foreground, fontSize: 13 }}>
          {result.blocked ? '✕' : '✓'} {reason}
        </Text>
      ))}
      {result.conflicts.map((conflict) => (
        <Text key={`${conflict.field}-${conflict.detail}`} style={{ color: siam.yellow.dark, fontSize: 13 }}>
          ⚠ {conflict.label}: {conflict.detail}
        </Text>
      ))}
      {open ? (
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>{result.summary}</Text>
          {COMPOSITE.map((row) => {
            const value = result.breakdown[row.key];
            return (
              <View key={row.key} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {stars(value)} {row.label}
                  </Text>
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
