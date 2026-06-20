import { spacing } from '../../lib/theme/tokens';

/** Fixed rows per launcher page — swipe horizontally between pages */
export const GRID_ROWS_PER_PAGE = 3;

/**
 * Adaptive column count for the app-icon service grid.
 * Small phone: 3 | Larger phone: 4 | Tablet: 5–6
 */
export function getServiceGridColumns(screenWidth: number): number {
  if (screenWidth >= 1024) {
    return 6;
  }
  if (screenWidth >= 768) {
    return 5;
  }
  if (screenWidth >= 380) {
    return 4;
  }
  return 3;
}

export function getServicesPerPage(screenWidth: number): number {
  return getServiceGridColumns(screenWidth) * GRID_ROWS_PER_PAGE;
}

export function getServiceTileSize(
  screenWidth: number,
  columns: number,
  horizontalPadding = spacing.screenPaddingX,
): number {
  const gutter = spacing.stackSm;
  const available = screenWidth - horizontalPadding * 2 - gutter * (columns - 1);
  return Math.floor(available / columns);
}

export function chunkIntoPages<T>(items: T[], perPage: number): T[][] {
  if (items.length === 0) {
    return [[]];
  }
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages;
}
