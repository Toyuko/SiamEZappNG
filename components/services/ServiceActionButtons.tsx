import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { getServiceTitle } from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { Button } from '../ui/Button';

type ServiceActionButtonsProps = {
  service: ServiceItem;
};

const BOOK_BUTTON_HEIGHT = 56;

export function ServiceActionButtons({ service }: ServiceActionButtonsProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceTitle(service, language);
  const bookLabel = t('cta.bookNow');
  const infoLabel = t('services.moreInfo');

  const openBook = () => {
    router.push({ pathname: '/(tabs)/book', params: { serviceSlug: service.slug } });
  };

  const openDetails = () => {
    router.push(`/services/${service.slug}`);
  };

  return (
    <View style={{ gap: spacing.stackSm }}>
      <Button label={`${bookLabel}, ${title}`} minHeight={BOOK_BUTTON_HEIGHT} onPress={openBook}>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={20} color="#ffffff" />
          <Text style={[styles.label, { color: '#ffffff' }]}>{bookLabel}</Text>
        </View>
      </Button>
      <Button label={`${infoLabel}, ${title}`} variant="secondary" minHeight={52} onPress={openDetails}>
        <View style={styles.row}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.label, { color: colors.primary }]}>{infoLabel}</Text>
        </View>
      </Button>
    </View>
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    minHeight: 24,
  },
  label: {
    fontSize: 17,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
};
