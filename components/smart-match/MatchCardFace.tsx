import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, MapPin, Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AVAILABILITY_LABELS, CATEGORY_LABELS } from '../../features/matching/matching.constants';
import { formatRate } from '../../features/matching/matching.scoring';
import type { RankedMatch } from '../../features/matching/matching.types';
import { radius, siam } from '../../lib/theme/tokens';
import { AvatarPhoto } from './AvatarPhoto';

type MatchCardFaceProps = {
  item: RankedMatch;
  stamp?: 'like' | 'pass' | 'super' | null;
  onOpenProfile?: () => void;
};

export function MatchCardFace({ item, stamp, onOpenProfile }: MatchCardFaceProps) {
  const { freelancer, result } = item;

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: siam.blue.dark,
      }}
    >
      <View style={{ ...StyleSheet.absoluteFillObject }}>
        <AvatarPhoto uri={freelancer.profilePhoto} name={freelancer.name} width="100%" height="100%" borderRadius={0} />
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(15,23,42,0.25)', 'rgba(12,24,72,0.92)']}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: '28%', padding: 16, justifyContent: 'flex-end' }}
      >
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: siam.yellow.DEFAULT,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 13 }}>{result.score}% MATCH</Text>
        </View>
        <Pressable onPress={onOpenProfile} accessibilityRole="button" accessibilityLabel={`View ${freelancer.name} profile`}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '800' }}>{freelancer.name}</Text>
            {freelancer.verified ? (
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: siam.blue.DEFAULT,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>✓</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 16, marginTop: 2 }}>
            {CATEGORY_LABELS[freelancer.category]}
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <Star size={16} color={siam.yellow.DEFAULT} fill={siam.yellow.DEFAULT} />
          <Text style={{ color: '#fff', fontWeight: '700' }}>{freelancer.rating.toFixed(1)}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>· {AVAILABILITY_LABELS[freelancer.availability]}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <Badge icon={<Text style={{ color: '#fff' }}>฿</Text>} label={formatRate(freelancer)} />
          <Badge icon={<MapPin size={13} color="#fff" />} label={freelancer.location} />
          <Badge icon={<Briefcase size={13} color="#fff" />} label={`${freelancer.yearsExperience} yrs exp.`} />
        </View>
      </LinearGradient>

      {stamp === 'like' ? <Stamp label="LIKE" color="#16a34a" align="right" /> : null}
      {stamp === 'pass' ? <Stamp label="PASS" color="#ef4444" align="left" /> : null}
      {stamp === 'super' ? <Stamp label="SUPER MATCH" color="#7c3aed" align="center" /> : null}
    </View>
  );
}

function Badge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderRadius: radius.full,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      {icon}
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

function Stamp({ label, color, align }: { label: string; color: string; align: 'left' | 'right' | 'center' }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 28,
        left: align === 'left' || align === 'center' ? 20 : undefined,
        right: align === 'right' ? 20 : undefined,
        alignSelf: align === 'center' ? 'center' : undefined,
        borderWidth: 4,
        borderColor: color,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 6,
        transform: [{ rotate: align === 'left' ? '-18deg' : align === 'right' ? '18deg' : '0deg' }],
        backgroundColor: 'rgba(255,255,255,0.9)',
      }}
    >
      <Text style={{ color, fontWeight: '900', fontSize: 22, letterSpacing: 1 }}>{label}</Text>
    </View>
  );
}
