import { Pressable, Text, View } from 'react-native';

import { siam } from '../../lib/theme/tokens';

type DemoModeBannerProps = {
  onReset?: () => void;
};

export function DemoModeBanner({ onReset }: DemoModeBannerProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        backgroundColor: siam.yellow.DEFAULT,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 12, letterSpacing: 0.6 }}>DEMO MODE</Text>
      <Text style={{ color: '#1f2937', fontSize: 12, flex: 1 }}>Works offline — no login, API, or database.</Text>
      {onReset ? (
        <Pressable onPress={onReset} accessibilityRole="button" accessibilityLabel="Reset demo">
          <Text style={{ color: siam.blue.dark, fontWeight: '700', fontSize: 12 }}>Reset</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
