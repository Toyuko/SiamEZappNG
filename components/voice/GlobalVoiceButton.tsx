import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '../../lib/i18n/i18n';
import { siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useVoiceFirst } from './VoiceFirstProvider';

/** Tab bar height from app/(tabs)/_layout.tsx */
const TAB_BAR_HEIGHT = 78;
const FAB_SIZE = 64;

export function GlobalVoiceButton() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { sheetOpen, openSheet } = useVoiceFirst();

  if (sheetOpen) {
    return null;
  }

  const bottomOffset = TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) - FAB_SIZE / 2;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: bottomOffset,
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel={t('voice.openAssistant')}
        style={({ pressed }) => ({
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: FAB_SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          borderWidth: 3,
          borderColor: isDark ? colors.card : '#ffffff',
          shadowColor: siam.blue.dark,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 8,
        })}
      >
        <Ionicons name="mic" size={30} color="#ffffff" />
      </Pressable>
    </View>
  );
}
