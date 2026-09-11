import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '../../lib/i18n/i18n';

/**
 * Non-blocking banner when the device reports no connectivity.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Treat only an explicit disconnect as offline. Android often reports
      // isInternetReachable as null while Wi-Fi is still usable.
      setOffline(state.isConnected === false);
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
        {t('common.offlineBanner')}
      </Text>
    </View>
  );
}
