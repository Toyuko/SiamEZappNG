import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuestHomeContent } from '../../components/home/GuestHomeContent';
import { MemberHomeContent } from '../../components/home/MemberHomeContent';
import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

export default function HomeScreen() {
  const { colors } = useTheme();
  const isGuest = useAuthStore((state) => state.isGuest);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isMember = Boolean(accessToken) && !isGuest;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPaddingX,
          paddingTop: spacing.stackMd,
          gap: spacing.sectionGapLg,
          paddingBottom: 40 + VOICE_FAB_SCROLL_EXTRA,
        }}
      >
        {isMember ? <MemberHomeContent /> : <GuestHomeContent />}
      </ScrollView>
    </SafeAreaView>
  );
}
