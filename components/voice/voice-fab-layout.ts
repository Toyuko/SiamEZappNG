import { spacing } from '../../lib/theme/tokens';

/**
 * Tab bar content height excluding system bottom inset.
 * Must match the base height in `app/(tabs)/_layout.tsx` (before `insets.bottom`).
 */
export const VOICE_FAB_TAB_BAR_HEIGHT = 78;

/** Inner bottom padding inside the tab bar (before safe-area inset). */
export const TAB_BAR_PADDING_BOTTOM = 12;

/** Visible FAB diameter */
export const VOICE_FAB_SIZE = 56;

/** Gap between FAB and tab bar top edge */
export const VOICE_FAB_MARGIN_ABOVE_TAB = 12;

/** Horizontal inset from screen edge (matches screen padding) */
export const VOICE_FAB_RIGHT_INSET = spacing.screenPaddingX;

/**
 * Extra bottom padding for scrollable tab content so the FAB does not cover CTAs.
 * Add to existing `paddingBottom` on main tab ScrollViews / FlatLists.
 */
export const VOICE_FAB_SCROLL_EXTRA = VOICE_FAB_SIZE + VOICE_FAB_MARGIN_ABOVE_TAB + 8;
