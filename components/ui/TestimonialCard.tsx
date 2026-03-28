import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useTheme } from '../../lib/theme/theme';
import { Card } from './Card';
import { siam } from '../../lib/theme/tokens';

type TestimonialCardProps = {
  service?: string;
  quote: string;
  name: string;
  role?: string;
  ratingStars?: number;
  ratingLabel: string;
  /** Tighter layout for carousels */
  compact?: boolean;
};

export function TestimonialCard({
  service,
  quote,
  name,
  role,
  ratingStars = 5,
  ratingLabel,
  compact = false,
}: TestimonialCardProps) {
  const { colors } = useTheme();
  const stars = Math.min(5, Math.max(0, Math.round(ratingStars)));

  const avatarSize = compact ? 36 : 44;
  const avatarRadius = avatarSize / 2;
  const personIconSize = compact ? 18 : 22;
  const rowGap = compact ? 10 : 14;
  const starSize = compact ? 14 : 17;
  const quoteSize = compact ? 'text-[14px] leading-5' : 'text-[17px] leading-7';
  const quoteTop = compact ? 'mt-2' : 'mt-3';
  const attributionTop = compact ? 'mt-2' : 'mt-4';

  return (
    <Card shadow="strong" compact={compact}>
      <View className="flex-row items-start" style={{ gap: rowGap }}>
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarRadius,
            backgroundColor: `${siam.blue.DEFAULT}18`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="person" size={personIconSize} color={siam.blue.DEFAULT} />
        </View>
        <View className="min-w-0 flex-1">
          {service ? (
            <Text
              className={`font-semibold uppercase tracking-wide ${compact ? 'text-[10px]' : 'text-xs'}`}
              style={{ color: siam.blue.DEFAULT, marginBottom: compact ? 4 : 8 }}
            >
              {service}
            </Text>
          ) : null}
          <View className="flex-row items-center" style={{ gap: compact ? 2 : 3, marginBottom: compact ? 4 : 6 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= stars ? 'star' : 'star-outline'}
                size={starSize}
                color={i <= stars ? siam.yellow.DEFAULT : colors.muted}
              />
            ))}
          </View>
          <Text
            className={`font-semibold uppercase tracking-wider ${compact ? 'text-[10px]' : 'text-[11px]'}`}
            style={{ color: siam.blue.DEFAULT }}
          >
            {ratingLabel}
          </Text>
          <Text
            className={`${quoteTop} ${quoteSize}`}
            style={{ color: colors.foreground, fontWeight: '500' }}
            numberOfLines={compact ? 4 : undefined}
          >
            {quote}
          </Text>
          <Text className={`${attributionTop} ${compact ? 'text-xs' : 'text-sm'} leading-5`} style={{ color: colors.muted }}>
            — {name}
          </Text>
          {role ? (
            <Text className={`${compact ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} leading-5`} style={{ color: colors.muted }}>
              {role}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
