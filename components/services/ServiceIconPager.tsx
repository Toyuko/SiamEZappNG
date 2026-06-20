import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import {
  chunkIntoPages,
  getServiceGridColumns,
  getServicesPerPage,
  getServiceTileSize,
  GRID_ROWS_PER_PAGE,
} from '../../features/services/grid-layout';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServiceIconTile } from './ServiceIconTile';

type ServiceIconPagerProps = {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
};

const COL_GAP = spacing.stackSm;
const ROW_GAP = spacing.stackMd;

function ServiceGridPage({
  services,
  columns,
  tileSize,
  pageWidth,
  onSelectService,
}: {
  services: ServiceItem[];
  columns: number;
  tileSize: number;
  pageWidth: number;
  onSelectService: (service: ServiceItem) => void;
}) {
  const slots: (ServiceItem | null)[] = [...services];
  const slotsPerPage = columns * GRID_ROWS_PER_PAGE;
  while (slots.length < slotsPerPage) {
    slots.push(null);
  }

  return (
    <View style={{ width: pageWidth, paddingTop: spacing.stackSm }}>
      {Array.from({ length: GRID_ROWS_PER_PAGE }, (_, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          style={{
            flexDirection: 'row',
            gap: COL_GAP,
            marginBottom: rowIndex < GRID_ROWS_PER_PAGE - 1 ? ROW_GAP : 0,
          }}
        >
          {Array.from({ length: columns }, (_, colIndex) => {
            const service = slots[rowIndex * columns + colIndex];
            if (!service) {
              return <View key={`empty-${colIndex}`} style={{ width: tileSize }} />;
            }
            return (
              <ServiceIconTile
                key={service.slug}
                service={service}
                tileSize={tileSize}
                onPress={onSelectService}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function ServiceIconPager({ services, onSelectService }: ServiceIconPagerProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const columns = getServiceGridColumns(screenWidth);
  const perPage = getServicesPerPage(screenWidth);
  const tileSize = getServiceTileSize(screenWidth, columns);
  const pageWidth = screenWidth - spacing.screenPaddingX * 2;
  const listRef = useRef<FlatList<ServiceItem[]>>(null);
  const [activePage, setActivePage] = useState(0);

  const pages = useMemo(() => chunkIntoPages(services, perPage), [perPage, services]);

  useEffect(() => {
    setActivePage(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [services, perPage]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      setActivePage(Math.max(0, Math.min(pages.length - 1, index)));
    },
    [pageWidth, pages.length],
  );

  const renderPage = useCallback(
    ({ item }: ListRenderItemInfo<ServiceItem[]>) => (
      <ServiceGridPage
        services={item}
        columns={columns}
        tileSize={tileSize}
        pageWidth={pageWidth}
        onSelectService={onSelectService}
      />
    ),
    [columns, onSelectService, pageWidth, tileSize],
  );

  if (services.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-center text-base font-semibold" style={{ color: colors.foreground }}>
          {t('services.emptyTitle')}
        </Text>
        <Text className="mt-2 max-w-[280px] text-center text-sm leading-5" style={{ color: colors.muted }}>
          {t('services.emptyHint')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, gap: spacing.stackMd }}>
      <FlatList
        ref={listRef}
        data={pages}
        key={`pager-${columns}-${perPage}`}
        keyExtractor={(_, index) => `page-${index}`}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={pageWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
        renderItem={renderPage}
        style={{ flexGrow: 0 }}
      />

      {pages.length > 1 ? (
        <View className="flex-row items-center justify-center gap-2">
          {pages.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={{
                width: index === activePage ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === activePage ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
