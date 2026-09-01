import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Heart, RotateCcw, Star, X, Zap } from 'lucide-react-native';

import { siam, shadows } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type MatchActionBarProps = {
  onUndo: () => void;
  onPass: () => void;
  onSave: () => void;
  onLike: () => void;
  onSuper: () => void;
  disableUndo?: boolean;
};

function CircleButton({
  color,
  size,
  onPress,
  label,
  children,
}: {
  color: string;
  size: number;
  onPress: () => void;
  label: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: color,
        opacity: pressed ? 0.8 : 1,
        ...shadows.cardMedium,
      })}
    >
      {children}
    </Pressable>
  );
}

export function MatchActionBar({ onUndo, onPass, onSave, onLike, onSuper, disableUndo }: MatchActionBarProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 8 }}>
      <CircleButton color={siam.yellow.DEFAULT} size={46} onPress={onUndo} label="Undo last swipe">
        <RotateCcw size={18} color={disableUndo ? '#94a3b8' : siam.yellow.dark} />
      </CircleButton>
      <CircleButton color="#ef4444" size={56} onPress={onPass} label="Pass">
        <X size={26} color="#ef4444" strokeWidth={2.6} />
      </CircleButton>
      <CircleButton color={siam.blue.DEFAULT} size={46} onPress={onSave} label="Save profile">
        <Star size={18} color={siam.blue.DEFAULT} />
      </CircleButton>
      <CircleButton color="#16a34a" size={56} onPress={onLike} label="Like">
        <Heart size={24} color="#16a34a" fill="#16a34a" />
      </CircleButton>
      <CircleButton color="#7c3aed" size={46} onPress={onSuper} label="Priority match">
        <Zap size={18} color="#7c3aed" fill="#7c3aed" />
      </CircleButton>
    </View>
  );
}
