import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { radius } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
};

export function SelectField({ label, placeholder, value, onChange, options, error }: SelectFieldProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="space-y-1.5">
      {label ? (
        <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
          {label}
        </Text>
      ) : null}
      <Pressable
        className="border px-4 py-3.5"
        style={{
          backgroundColor: colors.card,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: radius.button,
          borderWidth: 1,
        }}
        onPress={() => setOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
      >
        <Text className="text-base" style={{ color: selected ? colors.foreground : colors.muted }}>
          {selected?.label ?? placeholder}
        </Text>
      </Pressable>
      {error ? (
        <Text className="text-sm" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}
      {open ? (
        <View
          className="border p-2"
          style={{
            borderColor: colors.border,
            borderRadius: radius.button,
            backgroundColor: colors.card,
            maxHeight: 220,
          }}
        >
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View className="gap-1">
              {options.map((item) => {
                const active = item.value === value;
                return (
                  <Pressable
                    key={item.value}
                    className="rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: active ? colors.primary : 'transparent' }}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={{ color: active ? '#ffffff' : colors.foreground }}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
