import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../lib/theme/theme';

const FRAME_BG = '#111827';
const STATUS_TIME = '3:05';

type LoginPhoneFrameProps = {
  children: ReactNode;
};

export function LoginPhoneFrame({ children }: LoginPhoneFrameProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const showOuterBezel = Platform.OS === 'web' && width >= 520;
  const phoneWidth = showOuterBezel ? Math.min(390, width - 48) : width;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: showOuterBezel ? FRAME_BG : colors.background, paddingTop: showOuterBezel ? 24 : 0 },
      ]}
    >
      <View
        style={[
          styles.phone,
          showOuterBezel && styles.phoneBezel,
          {
            backgroundColor: colors.background,
            width: showOuterBezel ? phoneWidth : '100%',
            maxWidth: showOuterBezel ? phoneWidth : undefined,
            paddingTop: showOuterBezel ? 0 : insets.top,
          },
        ]}
      >
        <View style={[styles.statusBar, { backgroundColor: colors.background }]}>
          <Text style={[styles.statusTime, { color: colors.foreground }]}>{STATUS_TIME}</Text>
          <View style={[styles.dynamicIsland, { backgroundColor: isDark ? '#000000' : '#000000' }]} />
          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={16} color={colors.foreground} />
            <Ionicons name="wifi" size={16} color={colors.foreground} />
            <Ionicons name="battery-full" size={18} color={colors.foreground} />
          </View>
        </View>
        <View style={[styles.screenContent, { backgroundColor: colors.background }]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },
  phone: {
    flex: 1,
    overflow: 'hidden',
  },
  phoneBezel: {
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#1f2937',
    maxHeight: '96%',
  },
  statusBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    position: 'relative',
  },
  statusTime: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    minWidth: 48,
  },
  dynamicIsland: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -58,
    top: 10,
    width: 116,
    height: 32,
    borderRadius: 18,
    backgroundColor: '#000000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 64,
    justifyContent: 'flex-end',
  },
  screenContent: {
    flex: 1,
  },
});
