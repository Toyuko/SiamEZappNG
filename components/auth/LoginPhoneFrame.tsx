import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FRAME_BG = '#111827';
const SCREEN_BG = '#ffffff';
const STATUS_TIME = '3:05';

type LoginPhoneFrameProps = {
  children: ReactNode;
};

export function LoginPhoneFrame({ children }: LoginPhoneFrameProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const showOuterBezel = Platform.OS === 'web' && width >= 520;
  const phoneWidth = showOuterBezel ? Math.min(390, width - 48) : width;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: showOuterBezel ? FRAME_BG : SCREEN_BG, paddingTop: showOuterBezel ? 24 : 0 },
      ]}
    >
      <View
        style={[
          styles.phone,
          showOuterBezel && styles.phoneBezel,
          {
            width: showOuterBezel ? phoneWidth : '100%',
            maxWidth: showOuterBezel ? phoneWidth : undefined,
            paddingTop: showOuterBezel ? 0 : insets.top,
          },
        ]}
      >
        <View style={styles.statusBar}>
          <Text style={styles.statusTime}>{STATUS_TIME}</Text>
          <View style={styles.dynamicIsland} />
          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={16} color="#111827" />
            <Ionicons name="wifi" size={16} color="#111827" />
            <Ionicons name="battery-full" size={18} color="#111827" />
          </View>
        </View>
        <View style={styles.screenContent}>{children}</View>
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
    backgroundColor: SCREEN_BG,
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
    backgroundColor: SCREEN_BG,
  },
  statusTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
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
    backgroundColor: SCREEN_BG,
  },
});
