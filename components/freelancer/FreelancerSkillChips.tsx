import { Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';

import { useTheme } from '../../lib/theme/theme';

type FreelancerSkillChipsProps = {
  skills: string[];
  /** When provided, chips become removable. */
  onRemove?: (skill: string) => void;
  maxVisible?: number;
};

export function FreelancerSkillChips({ skills, onRemove, maxVisible }: FreelancerSkillChipsProps) {
  const { colors } = useTheme();
  const visible = maxVisible != null ? skills.slice(0, maxVisible) : skills;
  const overflow = maxVisible != null ? Math.max(0, skills.length - maxVisible) : 0;

  if (visible.length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap gap-1.5">
      {visible.map((skill) => (
        <View
          key={skill}
          className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
          style={{ backgroundColor: 'rgba(44, 84, 198, 0.1)' }}
        >
          <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
            {skill}
          </Text>
          {onRemove ? (
            <Pressable
              onPress={() => onRemove(skill)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${skill}`}
            >
              <X size={12} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ))}
      {overflow > 0 ? (
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-xs font-semibold" style={{ color: colors.muted }}>
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
