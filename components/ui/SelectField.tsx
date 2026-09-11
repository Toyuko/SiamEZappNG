import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const title = label ?? placeholder;

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
          minHeight: 52,
          justifyContent: 'center',
        }}
        hitSlop={8}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={title}
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

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => setOpen(false)}
            style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
          />
          <View
            style={{
              maxHeight: '70%',
              backgroundColor: colors.card,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              borderColor: colors.border,
              borderTopWidth: 1,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 12),
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.foreground,
                paddingHorizontal: 16,
                paddingBottom: 8,
              }}
            >
              {title}
            </Text>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8, gap: 4 }}
            >
              {options.map((item) => {
                const active = item.value === value;
                return (
                  <Pressable
                    key={item.value}
                    className="rounded-xl px-3 py-3"
                    style={{ backgroundColor: active ? colors.primary : 'transparent' }}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={{ color: active ? '#ffffff' : colors.foreground, fontSize: 16 }}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
