import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { useVoiceFabLayout } from '../../hooks/use-voice-fab-layout';
import { t } from '../../lib/i18n/i18n';
import { shadows, siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useVoiceFirst } from './VoiceFirstProvider';
import { VOICE_FAB_RIGHT_INSET, VOICE_FAB_SIZE } from './voice-fab-layout';

/**
 * Global voice FAB — bottom-right, opens VoiceListeningSheet.
 * Mounted from VoiceFirstProvider in app/_layout.tsx (all main app routes).
 */
export function GlobalVoiceButton() {
  const { colors } = useTheme();
  const { visible, bottom } = useVoiceFabLayout();
  const { sheetOpen, openSheet } = useVoiceFirst();

  if (!visible || sheetOpen) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: VOICE_FAB_RIGHT_INSET,
        bottom,
        zIndex: 100,
      }}
    >
      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel={t('voice.openAssistant')}
        style={({ pressed }) => ({
          width: VOICE_FAB_SIZE,
          height: VOICE_FAB_SIZE,
          borderRadius: VOICE_FAB_SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
          ...shadows.cardMedium,
          shadowColor: siam.blue.dark,
        })}
      >
        <Ionicons name="mic" size={28} color="#ffffff" accessibilityIgnoresInvertColors />
      </Pressable>
    </View>
  );
}
