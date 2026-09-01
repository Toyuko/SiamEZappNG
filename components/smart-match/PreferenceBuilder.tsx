import { Pressable, Text, TextInput, View } from 'react-native';

import { FLEXIBILITY_LABELS, IMPORTANCE_LABELS } from '../../features/matching/matching.constants';
import type { PreferenceFlexibility, PreferenceImportance, PreferenceItem } from '../../features/matching/matching.types';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const IMPORTANCE_ORDER: PreferenceImportance[] = ['must_have', 'preferred', 'nice_to_have', 'not_important'];

type PreferenceBuilderProps = {
  title?: string;
  items: PreferenceItem[];
  onChange: (items: PreferenceItem[]) => void;
  tone?: 'consumer' | 'corporate';
};

function formatValue(item: PreferenceItem): string {
  if (Array.isArray(item.value)) return item.value.join(', ');
  if (typeof item.value === 'boolean') return item.value ? 'Yes' : 'No';
  return String(item.value ?? '');
}

export function PreferenceBuilder({ title, items, onChange, tone = 'consumer' }: PreferenceBuilderProps) {
  const { colors } = useTheme();
  const accent = tone === 'corporate' ? siam.blue.DEFAULT : siam.yellow.DEFAULT;

  const patch = (id: string, partial: Partial<PreferenceItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  };

  return (
    <View style={{ gap: spacing.stackMd }}>
      {title ? (
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: '800' }}>{title}</Text>
      ) : null}
      {items.map((item) => (
        <View
          key={item.id}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: 14,
            backgroundColor: colors.card,
            gap: 10,
          }}
        >
          <Text style={{ color: colors.foreground, fontWeight: '800', letterSpacing: 0.4, fontSize: 13 }}>
            {item.label.toUpperCase()}
          </Text>
          <TextInput
            value={formatValue(item)}
            onChangeText={(text) => {
              if (typeof item.value === 'boolean') {
                patch(item.id, { value: /yes|true|1/i.test(text) });
                return;
              }
              if (typeof item.value === 'number') {
                const n = Number(text.replace(/[^\d.]/g, ''));
                patch(item.id, { value: Number.isFinite(n) ? n : item.value });
                return;
              }
              if (Array.isArray(item.value)) {
                patch(
                  item.id,
                  {
                    value: text
                      .split(',')
                      .map((part) => part.trim())
                      .filter(Boolean),
                  },
                );
                return;
              }
              patch(item.id, { value: text });
            }}
            placeholder="Value"
            placeholderTextColor={colors.muted}
            style={{
              minHeight: 44,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              color: colors.foreground,
            }}
          />
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>IMPORTANCE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {IMPORTANCE_ORDER.map((importance) => {
              const selected = item.importance === importance;
              return (
                <Pressable
                  key={importance}
                  onPress={() => patch(item.id, { importance })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: radius.full,
                    borderWidth: 1,
                    borderColor: selected ? accent : colors.border,
                    backgroundColor: selected ? (tone === 'corporate' ? siam.blue.DEFAULT : 'rgba(44,84,198,0.08)') : colors.background,
                  }}
                >
                  <Text style={{ color: selected && tone === 'corporate' ? '#fff' : colors.foreground, fontSize: 12, fontWeight: '700' }}>
                    {IMPORTANCE_LABELS[importance]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['fixed', 'flexible'] as PreferenceFlexibility[]).map((flexibility) => {
              const selected = item.flexibility === flexibility;
              return (
                <Pressable
                  key={flexibility}
                  onPress={() => patch(item.id, { flexibility })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={{
                    flex: 1,
                    minHeight: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: selected ? siam.blue.DEFAULT : colors.border,
                    backgroundColor: selected ? 'rgba(44,84,198,0.08)' : colors.background,
                  }}
                >
                  <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 12 }}>
                    {FLEXIBILITY_LABELS[flexibility]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
