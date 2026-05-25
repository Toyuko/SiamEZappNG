import { Pressable, Text, View } from 'react-native';
import { MessageCircle, X } from 'lucide-react-native';

import { useTheme } from '../../lib/theme/theme';
import type { TrackingMessageToast } from '../../hooks/use-job-tracking-realtime';

type TrackingMessageToastProps = {
  toast: TrackingMessageToast;
  onDismiss: () => void;
};

export function TrackingMessageToastBanner({ toast, onDismiss }: TrackingMessageToastProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(91, 118, 224, 0.4)' : 'rgba(44, 84, 198, 0.3)',
        backgroundColor: colors.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <MessageCircle size={16} color={colors.primary} strokeWidth={2} style={{ marginTop: 2 }} />
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.foreground }}>
        {toast.message}
      </Text>
      <Pressable onPress={onDismiss} hitSlop={8} accessibilityRole="button">
        <X size={16} color={colors.muted} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
