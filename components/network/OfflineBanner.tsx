import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Non-blocking banner when the device reports no connectivity.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected !== false && state.isInternetReachable !== false;
      setOffline(!connected);
    });
    return unsubscribe;
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <View
      accessibilityRole="alert"
      style={{
        paddingTop: Math.max(insets.top, 8),
        paddingBottom: 8,
        paddingHorizontal: 16,
        backgroundColor: '#92400E',
      }}
    >
      <Text style={{ color: '#FFFBEB', textAlign: 'center', fontSize: 13, fontWeight: '600' }}>
        You’re offline. Some actions may not work until you’re back online.
      </Text>
    </View>
  );
}
