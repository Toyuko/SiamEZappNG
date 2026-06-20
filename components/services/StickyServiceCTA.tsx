import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const LINE_OFFICIAL_URL = 'https://line.me/R/ti/p/@siamez';

/** Total sticky bar height — keep in sync with services screen scroll padding */
export const STICKY_SERVICE_CTA_HEIGHT = 60;

type StickyServiceCTAProps = {
  serviceSlug?: string;
};

export function StickyServiceCTA({ serviceSlug }: StickyServiceCTAProps) {
  const router = useRouter();
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
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: STICKY_SERVICE_CTA_HEIGHT,
        paddingHorizontal: spacing.screenPaddingX,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <StickyButton
        label={t('cta.bookNow')}
        primary
        onPress={() =>
          router.push({
            pathname: '/(tabs)/book',
            params: serviceSlug ? { serviceSlug } : undefined,
          })
        }
      />
      <StickyButton label={t('services.lineOfficial')} onPress={() => void openLine()} />
    </View>
  );
}

function StickyButton({
  label,
  primary = false,
  onPress,
}: {
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        height: 44,
        borderRadius: radius.button,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        opacity: pressed ? 0.9 : 1,
        backgroundColor: primary ? colors.primary : colors.card,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.primary,
      })}
    >
      <Text
        className="text-sm font-semibold"
        style={{ color: primary ? '#ffffff' : colors.primary }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {label}
      </Text>
    </Pressable>
  );
}
