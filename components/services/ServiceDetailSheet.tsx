import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getBadgeLabel,
  getServiceDescription,
  getServicePriceFrom,
  getServiceTitle,
} from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { Button } from '../ui/Button';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

const LINE_OFFICIAL_URL = 'https://line.me/R/ti/p/@siamez';
const SIAMEZ_PHONE = '+66643438768';
const SIAMEZ_PHONE_DISPLAY = '+66 64 343 8768';

type ServiceDetailSheetProps = {
  service: ServiceItem | null;
  visible: boolean;
  onClose: () => void;
};

export function ServiceDetailSheet({ service, visible, onClose }: ServiceDetailSheetProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const insets = useSafeAreaInsets();

  if (!service) {
    return null;
  }

  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const priceLine = getServicePriceFrom(service);
  const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
  const hasFullDetailPage = service.pricingPackages != null && service.pricingPackages.length > 0;

  const openLine = async () => {
    const canOpen = await Linking.canOpenURL(LINE_OFFICIAL_URL);
    if (!canOpen) {
      Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
      return;
    }
    await Linking.openURL(LINE_OFFICIAL_URL);
  };

  const openPhone = async () => {
    const url = `tel:${SIAMEZ_PHONE}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
      return;
    }
    await Linking.openURL(url);
  };

  const openBook = () => {
    onClose();
    router.push({ pathname: '/(tabs)/book', params: { serviceSlug: service.slug } });
  };

  const openFullDetail = () => {
    onClose();
    router.push(`/services/${service.slug}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.back')} />
          <View
            style={{
              marginTop: 'auto',
              maxHeight: '88%',
              backgroundColor: colors.card,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: Math.max(insets.bottom, 12),
            }}
          >
            <View className="items-center pt-3 pb-2">
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                }}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: spacing.screenPaddingX,
                paddingBottom: spacing.stackMd,
                gap: spacing.stackMd,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: radius.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: tint,
                  }}
                >
                  <Ionicons name={service.icon} size={28} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-lg font-bold leading-6" style={{ color: colors.foreground }}>
                    {title}
                  </Text>
                  {service.badges.length > 0 ? (
                    <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                      {service.badges.map((badge) => (
                        <View
                          key={badge}
                          className="rounded-full px-2 py-0.5"
                          style={{
                            backgroundColor: isDark ? 'rgba(91, 118, 224, 0.25)' : 'rgba(44, 84, 198, 0.1)',
                          }}
                        >
                          <Text className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                            {getBadgeLabel(badge)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
                <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('common.back')}>
                  <Ionicons name="close" size={24} color={colors.muted} />
                </Pressable>
              </View>

              <Text className="text-sm leading-5" style={{ color: colors.muted }}>
                {description}
              </Text>

              {priceLine ? (
                <Text className="text-base font-semibold" style={{ color: colors.primary }}>
                  {priceLine}
                </Text>
              ) : (
                <Text className="text-sm font-medium" style={{ color: colors.muted }}>
                  {t('book.pricingQuote')}
                </Text>
              )}

              {service.estimatedTime ? (
                <View>
                  <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.muted }}>
                    {t('services.estimatedTime')}
                  </Text>
                  <Text className="mt-1 text-sm" style={{ color: colors.foreground }}>
                    {service.estimatedTime}
                  </Text>
                </View>
              ) : null}

              {service.requirements && service.requirements.length > 0 ? (
                <View>
                  <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.muted }}>
                    {t('serviceDetail.requirements')}
                  </Text>
                  {service.requirements.map((req) => (
                    <Text key={req} className="mt-1 text-sm leading-5" style={{ color: colors.foreground }}>
                      • {req}
                    </Text>
                  ))}
                </View>
              ) : null}

              <View style={{ gap: spacing.stackSm, marginTop: spacing.stackSm }}>
                <Button label={t('cta.bookNow')} onPress={openBook} />
                <Button label={t('services.lineOfficial')} variant="secondary" onPress={() => void openLine()} />
                <Button
                  label={SIAMEZ_PHONE_DISPLAY}
                  variant="secondary"
                  onPress={() => void openPhone()}
                />
                {hasFullDetailPage ? (
                  <Button label={t('services.viewDetails')} variant="secondary" onPress={openFullDetail} />
                ) : null}
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
});
