import { useRef, useState } from 'react';
import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Check, Monitor, Moon, MoonStar, Sun, type LucideIcon } from 'lucide-react-native';

import { t } from '../../lib/i18n/i18n';
import { radius, shadows } from '../../lib/theme/tokens';
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

const MENU_WIDTH = 176;

/**
 * Website-style theme dropdown: an icon trigger that opens a small menu with
 * Light / Dark / Night / Auto options (each with an icon and a check on the
 * active one).
 */
export function ThemePicker() {
  const { colors, isDark } = useTheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { width: windowWidth } = useWindowDimensions();

  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 0 });

  const active = OPTIONS.find((option) => option.mode === themeMode) ?? OPTIONS[0];
  const TriggerIcon = active.Icon;

  const openMenu = () => {
    const node = triggerRef.current;
    if (node && typeof node.measureInWindow === 'function') {
      node.measureInWindow((x, y, w, h) => {
        setAnchor({ top: y + h + 8, right: Math.max(12, windowWidth - (x + w)) });
        setOpen(true);
      });
    } else {
      setAnchor({ top: 56, right: 12 });
      setOpen(true);
    }
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel={t('settings.theme')}
        style={{
          height: 40,
          width: 40,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <TriggerIcon size={20} color={colors.primary} strokeWidth={2} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
          <View
            style={{
              position: 'absolute',
              top: anchor.top,
              right: anchor.right,
              width: MENU_WIDTH,
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 6,
              ...(isDark ? shadows.cardDarkStrong : shadows.cardStrong),
            }}
          >
            {OPTIONS.map((option) => {
              const selected = option.mode === themeMode;
              const OptionIcon = option.Icon;
              return (
                <Pressable
                  key={option.mode}
                  onPress={() => {
                    setTheme(option.mode);
                    setOpen(false);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    marginHorizontal: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderRadius: radius.md,
                    backgroundColor: selected || pressed ? `${colors.primary}1f` : 'transparent',
                  })}
                >
                  <OptionIcon size={18} color={selected ? colors.primary : colors.foreground} strokeWidth={2} />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: selected ? '700' : '500',
                      color: selected ? colors.primary : colors.foreground,
                    }}
                  >
                    {t(option.labelKey)}
                  </Text>
                  {selected ? <Check size={16} color={colors.primary} strokeWidth={2.5} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
