import { useState } from 'react';
import { Image, Text, View } from 'react-native';

import { siam } from '../../lib/theme/tokens';

type AvatarPhotoProps = {
  uri: string | null;
  name: string;
  width: number | string;
  height: number | string;
  borderRadius?: number;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AvatarPhoto({ uri, name, width, height, borderRadius = 20 }: AvatarPhotoProps) {
  const [failed, setFailed] = useState(!uri);

  if (!uri || failed) {
    return (
      <View
        style={{
          width,
          height,
          borderRadius,
          backgroundColor: siam.blue.dark,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: siam.yellow.DEFAULT, fontSize: 42, fontWeight: '800' }}>{initials(name) || '?'}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      onError={() => setFailed(true)}
      style={{ width, height, borderRadius, backgroundColor: siam.blue.dark }}
    />
  );
}
