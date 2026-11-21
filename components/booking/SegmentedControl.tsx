import { Pressable, Text, View } from 'react-native';

import { radius, siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type Option = { value: string; label: string };

type SegmentedControlProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: selected ? siam.blue.DEFAULT : colors.border,
              backgroundColor: selected ? siam.blue.DEFAULT : colors.card,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 10,
              paddingVertical: 12,
            }}
          >
            <Text
              style={{
                color: selected ? '#fff' : colors.text,
                fontSize: 14,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
