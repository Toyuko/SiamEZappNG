import { Pressable, View } from 'react-native';
import { Monitor, Moon, MoonStar, Sun, type LucideIcon } from 'lucide-react-native';

import { t } from '../../lib/i18n/i18n';
import { radius } from '../../lib/theme/tokens';
import { useTheme, type ThemeMode } from '../../lib/theme/theme';
import { useThemeStore } from '../../lib/theme/useThemeStore';

type ThemeOption = {
  mode: ThemeMode;
  labelKey: string;
  Icon: LucideIcon;
};

const OPTIONS: ThemeOption[] = [
  { mode: 'light', labelKey: 'settings.light', Icon: Sun },
  { mode: 'dark', labelKey: 'settings.dark', Icon: Moon },
  { mode: 'night', labelKey: 'settings.night', Icon: MoonStar },
  { mode: 'system', labelKey: 'settings.auto', Icon: Monitor },
];

/**
 * Website-style theme switcher: a compact row of icon pills for
 * Light / Dark / Night / Auto — matches the adjacent language toggle.
 */
export function ThemePicker() {
  const { colors } = useTheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        height: 40,
        paddingHorizontal: 4,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {OPTIONS.map((option) => {
        const selected = option.mode === themeMode;
        const OptionIcon = option.Icon;

        return (
          <Pressable
            key={option.mode}
            onPress={() => setTheme(option.mode)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={t(option.labelKey)}
            style={({ pressed }) => ({
              minWidth: 36,
              height: 32,
              paddingHorizontal: 8,
              borderRadius: radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? colors.primary : pressed ? `${colors.primary}14` : 'transparent',
            })}
          >
            <OptionIcon size={17} color={selected ? '#ffffff' : colors.muted} strokeWidth={2} />
          </Pressable>
        );
      })}
    </View>
  );
}
