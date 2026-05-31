import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  VOICE_FAB_MARGIN_ABOVE_TAB,
  VOICE_FAB_TAB_BAR_HEIGHT,
} from '../components/voice/voice-fab-layout';

/** Routes where the voice FAB would clutter focused workflows */
function isVoiceFabHidden(segments: string[]): boolean {
  const [top, second] = segments;

  if (top === '(auth)') {
    return true;
  }

  if (top === 'client' && (second === 'chat' || second === 'tracking')) {
    return true;
  }

  if (top === 'freelancer' && (second === 'chat' || second === 'tracking')) {
    return true;
  }

  return false;
}

export function useVoiceFabLayout() {
  const segments = useSegments() as string[];
  const insets = useSafeAreaInsets();
  const visible = !isVoiceFabHidden(segments);
  const hasTabBar = segments[0] === '(tabs)';
  const tabBarOffset = hasTabBar ? VOICE_FAB_TAB_BAR_HEIGHT : 0;
  const bottom = tabBarOffset + Math.max(insets.bottom, 8) + VOICE_FAB_MARGIN_ABOVE_TAB;

  return { visible, bottom, hasTabBar };
}
