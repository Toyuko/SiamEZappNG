import { Alert, Linking, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../ui/Button';
import { VOICE_FAB_SCROLL_EXTRA } from '../voice/voice-fab-layout';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const LINE_OFFICIAL_URL = 'https://line.me/R/ti/p/@siamez';

type StickyServiceCTAProps = {
  /** Optional slug to pre-select in the booking wizard */
  serviceSlug?: string;
};

export function StickyServiceCTA({ serviceSlug }: StickyServiceCTAProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const openLine = async () => {
    const canOpen = await Linking.canOpenURL(LINE_OFFICIAL_URL);
    if (!canOpen) {
      Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
      return;
    }
    await Linking.openURL(LINE_OFFICIAL_URL);
  };

  const bottomOffset = Math.max(insets.bottom, 12) + VOICE_FAB_SCROLL_EXTRA;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: spacing.screenPaddingX,
        paddingBottom: bottomOffset,
        paddingTop: spacing.stackSm,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.stackSm,
      }}
    >
      <Button
        label={t('cta.bookNow')}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/book',
            params: serviceSlug ? { serviceSlug } : undefined,
          })
        }
      />
      <Button label={t('services.lineOfficial')} variant="secondary" onPress={() => void openLine()} />
    </View>
  );
}
