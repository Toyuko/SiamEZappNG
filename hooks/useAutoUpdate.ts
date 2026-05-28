import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export function useAutoUpdate() {
  const checkForUpdate = useCallback(async () => {
    if (Updates.isEmergencyLaunch) {
      return;
    }

    if (!Updates.isEnabled) {
      return;
    }

    try {
      const result = await Updates.checkForUpdateAsync();

      if (!result.isAvailable) {
        return;
      }

      await Updates.fetchUpdateAsync();

      Alert.alert(
        'New Update Available',
        'A new version of SiamEZ has been downloaded. Please restart the app to apply the update.',
        [
          {
            text: 'Update Now',
            onPress: () => {
              void Updates.reloadAsync();
            },
          },
        ],
      );
    } catch (error) {
      console.log('[useAutoUpdate] Failed to check or fetch update:', error);
    }
  }, []);

  return { checkForUpdate };
}
