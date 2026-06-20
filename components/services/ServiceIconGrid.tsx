import { useMemo } from 'react';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';

import { getServiceGridColumns } from '../../features/services/grid-layout';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServiceIconTile } from './ServiceIconTile';

const ROW_GAP = spacing.stackSm;
const COL_GAP = spacing.stackSm;

type ServiceIconGridProps = {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
  ListHeaderComponent?: React.ReactElement | null;
  bottomPadding?: number;
};

export function ServiceIconGrid({
  services,
  onSelectService,
  ListHeaderComponent,
  bottomPadding = spacing.stackLg,
}: ServiceIconGridProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const columns = getServiceGridColumns(screenWidth);
  const horizontalInset = spacing.screenPaddingX * 2;
  const listWidth = screenWidth - horizontalInset;
  const tileSize = Math.floor((listWidth - COL_GAP * (columns - 1)) / columns);

  const listKey = useMemo(() => `service-grid-${columns}`, [columns]);

  if (services.length === 0) {
    return (
      <View className="flex-1">
        {ListHeaderComponent}
        <View className="items-center py-10">
          <Text className="text-center text-base font-semibold" style={{ color: colors.foreground }}>
            {t('services.emptyTitle')}
          </Text>
          <Text className="mt-2 max-w-[280px] text-center text-sm leading-5" style={{ color: colors.muted }}>
            {t('services.emptyHint')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      key={listKey}
      data={services}
      numColumns={columns}
      keyExtractor={(item) => item.slug}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      columnWrapperStyle={
        columns > 1
          ? {
              gap: COL_GAP,
              marginBottom: ROW_GAP,
            }
          : undefined
      }
      renderItem={({ item }) => (
        <ServiceIconTile service={item} tileSize={tileSize} onPress={onSelectService} />
      )}
    />
  );
}
