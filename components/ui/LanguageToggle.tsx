import { Pressable, Text, View } from 'react-native';
import { Languages } from 'lucide-react-native';

import type { AppLanguage } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const LANGS: { code: AppLanguage; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'th', label: 'TH' },
];

/** Website-style language switcher: a translate icon + EN / TH segmented pills. */
export function LanguageToggle() {
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 40,
        paddingHorizontal: 8,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Languages size={18} color={colors.muted} strokeWidth={2} />
      {LANGS.map(({ code, label }) => {
        const selected = language === code;
        return (
          <Pressable
            key={code}
            onPress={() => setLanguage(code)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              minWidth: 34,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: selected ? '#ffffff' : colors.muted,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
