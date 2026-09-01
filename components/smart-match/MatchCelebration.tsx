import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { CATEGORY_LABELS } from '../../features/matching/matching.constants';
import type { CelebrationPayload } from '../../features/matching/matching.types';
import { goldGradient, radius, siam, spacing } from '../../lib/theme/tokens';
import { Button } from '../ui/Button';
import { AvatarPhoto } from './AvatarPhoto';

type MatchCelebrationProps = {
  payload: CelebrationPayload;
  onChat: () => void;
  onBook: () => void;
  onContinue: () => void;
};

export function MatchCelebration({ payload, onChat, onBook, onContinue }: MatchCelebrationProps) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        backgroundColor: 'rgba(12,24,72,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <LinearGradient
        colors={[...goldGradient.colors]}
        start={goldGradient.start}
        end={goldGradient.end}
        style={{ width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
      >
        <Text style={{ fontSize: 40 }}>🎉</Text>
      </LinearGradient>
      <Text style={{ color: siam.yellow.DEFAULT, fontSize: 28, fontWeight: '900', letterSpacing: 1 }}>IT'S A MATCH!</Text>
      <View style={{ marginTop: 18, marginBottom: 8 }}>
        <AvatarPhoto uri={payload.freelancerPhoto} name={payload.freelancerName} width={96} height={96} borderRadius={48} />
      </View>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>You matched with {payload.freelancerName}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{CATEGORY_LABELS[payload.category]}</Text>
      <Text style={{ color: siam.yellow.DEFAULT, marginTop: 10, fontWeight: '800' }}>{payload.score}% AI compatibility</Text>
      <View style={{ width: '100%', maxWidth: 360, gap: spacing.stackMd, marginTop: 28 }}>
        <Button label="Start Chat" onPress={onChat} variant="accent" gradient />
        <Button label="Book Freelancer" onPress={onBook} variant="primary" gradient />
        <Pressable
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue browsing"
          style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.button }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Continue Browsing</Text>
        </Pressable>
      </View>
    </View>
  );
}
