import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CATEGORY_IMAGES } from '../../features/services/category-images';
import { getCategoryLabel } from '../../features/services/service-display';
import { getServicesByCategory } from '../../features/services/services.data';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { motion } from '../../lib/theme/motion';
import { radius, shadows } from '../../lib/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DESCRIPTION_KEYS: Record<ServiceCategoryId, string> = {
  'driving-vehicle': 'services.categoryDescriptions.drivingVehicle',
  'immigration-legal': 'services.categoryDescriptions.immigrationLegal',
  'translation-documents': 'services.categoryDescriptions.translationDocuments',
  'home-property': 'services.categoryDescriptions.homeProperty',
  'transport-private-driver': 'services.categoryDescriptions.transportPrivateDriver',
  'events-lifestyle': 'services.categoryDescriptions.eventsLifestyle',
  'business-services': 'services.categoryDescriptions.businessServices',
};

type CategoryDiscoveryCardProps = {
  categoryId: ServiceCategoryId;
  width: number;
  onPress: (categoryId: ServiceCategoryId) => void;
};

/**
 * Premium image category tile for the dedicated Categories screen.
 */
export function CategoryDiscoveryCard({ categoryId, width, onPress }: CategoryDiscoveryCardProps) {
  const label = getCategoryLabel(categoryId);
  const description = t(DESCRIPTION_KEYS[categoryId]);
  const serviceCount = getServicesByCategory(categoryId).length;
  const heroImage = CATEGORY_IMAGES[categoryId];
  const mediaHeight = Math.round(width * 0.68);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${t('services.serviceCount', { count: serviceCount })}`}
      onPress={() => onPress(categoryId)}
      onPressIn={() => {
        scale.value = withTiming(motion.pressScale, { duration: motion.cardPress });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.cardPress });
      }}
      style={[
        animatedStyle,
        {
          width,
          borderRadius: radius.xl,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(5, 42, 112, 0.08)',
          ...shadows.cardLight,
        },
      ]}
    >
      <View style={{ width, height: mediaHeight, overflow: 'hidden' }}>
        <Image
          source={heroImage}
          accessibilityIgnoresInvertColors
          style={{ width, height: mediaHeight }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(6, 43, 120, 0.18)', 'rgba(6, 43, 120, 0.82)']}
          locations={[0.32, 0.62, 1]}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <View
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 10,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Text
            style={{ flex: 1, fontSize: 14, fontWeight: '800', color: '#FFFFFF', lineHeight: 18 }}
            numberOfLines={2}
          >
            {label}
          </Text>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.94)',
            }}
          >
            <Ionicons name="arrow-forward" size={14} color="#0647C7" />
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, gap: 6 }}>
        <Text style={{ fontSize: 12, lineHeight: 16, color: '#60789C' }} numberOfLines={2}>
          {description}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#0647C7' }}>
          {t('services.serviceCount', { count: serviceCount })} →
        </Text>
      </View>
    </AnimatedPressable>
  );
}
