import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { VOICE_FAB_SCROLL_EXTRA } from '../voice/voice-fab-layout';

const LINE_OFFICIAL_URL = 'https://line.me/R/ti/p/@siamez';

export function FloatingLineButton() {
  const { colors } = useTheme();

  const openLine = async () => {
    const canOpen = await Linking.canOpenURL(LINE_OFFICIAL_URL);
    if (!canOpen) {
      Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
      return;
    }
    await Linking.openURL(LINE_OFFICIAL_URL);
  };

  return (
    <Pressable
      onPress={() => void openLine()}
      accessibilityRole="button"
      accessibilityLabel={t('services.lineOfficial')}
      style={({ pressed }) => ({
        position: 'absolute',
        left: spacing.screenPaddingX,
        bottom: VOICE_FAB_SCROLL_EXTRA,
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#06C755',
        opacity: pressed ? 0.88 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 2,
        borderColor: colors.background,
      })}
    >
      <Ionicons name="chatbubble-ellipses" size={22} color="#ffffff" />
    </Pressable>
  );
}
