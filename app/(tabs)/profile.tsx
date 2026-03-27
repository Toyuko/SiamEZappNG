import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { useAuth } from '../../hooks/use-auth';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { useTheme, type ThemeMode } from '../../lib/theme/theme';
import { useThemeStore } from '../../lib/theme/useThemeStore';
import { useAuthStore } from '../../store/auth-store';

type RowItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightSlot?: ReactNode;
};

function RowItem({ icon, label, subtitle, onPress, showChevron = true, rightSlot }: RowItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 py-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium" style={{ color: colors.text }}>
          {label}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs" style={{ color: colors.mutedText }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightSlot}
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={colors.mutedText} /> : null}
    </Pressable>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { user, isGuest } = useAuthStore();
  const { colors } = useTheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [caseUpdatesEnabled, setCaseUpdatesEnabled] = useState(true);
  const [paymentRemindersEnabled, setPaymentRemindersEnabled] = useState(true);
  const [documentRequestsEnabled, setDocumentRequestsEnabled] = useState(true);

  const comingSoon = (title: string) => Alert.alert(title, 'This feature will be available soon.');

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header title={t('tabs.profile')} subtitle="Manage your account and access preferences." gradient />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16, paddingBottom: 28, gap: 12 }}>
        {isGuest ? (
          <View className="gap-3">
            <Card>
              <Text className="text-sm" style={{ color: colors.mutedText }}>
                Guest mode
              </Text>
              <Text className="mt-1 text-base font-semibold" style={{ color: colors.text }}>
                Log in or create an account to unlock your full control center.
              </Text>
            </Card>
            <Button label="Login" onPress={() => router.replace('/(auth)/login')} />
            <Button label="Sign Up" variant="secondary" onPress={() => router.replace('/(auth)/signup')} />
          </View>
        ) : (
          <>
            <Card>
              <Text className="text-sm" style={{ color: colors.mutedText }}>
                Signed in as
              </Text>
              <Text className="mt-1 text-base font-semibold" style={{ color: colors.text }}>
                {user?.email ?? 'Unknown user'}
              </Text>
            </Card>

            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                Account
              </Text>
              <View className="mt-2">
                <RowItem icon="person-outline" label="Edit profile" onPress={() => comingSoon('Edit profile')} />
                <Divider />
                <RowItem icon="mail-outline" label="Change email" onPress={() => comingSoon('Change email')} />
                <Divider />
                <RowItem icon="lock-closed-outline" label="Change password" onPress={() => comingSoon('Change password')} />
              </View>
            </Card>

            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                Preferences
              </Text>
              <Text className="mt-3 text-sm font-medium" style={{ color: colors.mutedText }}>
                {t('settings.theme')}
              </Text>
              <View className="mt-2 flex-row gap-2">
                {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                  <Pressable
                    key={mode}
                    className="rounded-full px-4 py-2"
                    style={{
                      backgroundColor: themeMode === mode ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => setTheme(mode)}
                  >
                    <Text style={{ color: themeMode === mode ? '#ffffff' : colors.text }}>{t(`settings.${mode}`)}</Text>
                  </Pressable>
                ))}
              </View>
              <Text className="mt-4 text-sm font-medium" style={{ color: colors.mutedText }}>
                {t('settings.language')}
              </Text>
              <View className="mt-2 flex-row gap-2">
                {(['en', 'th'] as const).map((lang) => (
                  <Pressable
                    key={lang}
                    className="rounded-full px-4 py-2"
                    style={{
                      backgroundColor: language === lang ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => setLanguage(lang)}
                  >
                    <Text style={{ color: language === lang ? '#ffffff' : colors.text }}>{lang === 'en' ? t('settings.english') : t('settings.thai')}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                Notifications
              </Text>
              <View className="mt-2">
                <RowItem
                  icon="notifications-outline"
                  label="Push notifications"
                  showChevron={false}
                  rightSlot={<Switch value={pushEnabled} onValueChange={setPushEnabled} />}
                />
                <Divider />
                <RowItem
                  icon="folder-open-outline"
                  label="Case updates"
                  showChevron={false}
                  rightSlot={<Switch value={caseUpdatesEnabled} onValueChange={setCaseUpdatesEnabled} disabled={!pushEnabled} />}
                />
                <Divider />
                <RowItem
                  icon="card-outline"
                  label="Payment reminders"
                  showChevron={false}
                  rightSlot={<Switch value={paymentRemindersEnabled} onValueChange={setPaymentRemindersEnabled} disabled={!pushEnabled} />}
                />
                <Divider />
                <RowItem
                  icon="document-text-outline"
                  label="Document requests"
                  showChevron={false}
                  rightSlot={<Switch value={documentRequestsEnabled} onValueChange={setDocumentRequestsEnabled} disabled={!pushEnabled} />}
                />
              </View>
            </Card>

            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                Payments
              </Text>
              <View className="mt-2">
                <RowItem icon="wallet-outline" label="Payment methods" subtitle="Thai QR, bank transfer, Wise" onPress={() => comingSoon('Payment methods')} />
                <Divider />
                <RowItem icon="receipt-outline" label="Payment history" onPress={() => comingSoon('Payment history')} />
              </View>
            </Card>

            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                My information
              </Text>
              <View className="mt-2">
                <RowItem icon="person-circle-outline" label="Name" onPress={() => comingSoon('Name')} />
                <Divider />
                <RowItem icon="call-outline" label="Phone" onPress={() => comingSoon('Phone')} />
                <Divider />
                <RowItem icon="id-card-outline" label="Passport info" onPress={() => comingSoon('Passport info')} />
                <Divider />
                <RowItem icon="home-outline" label="Address" onPress={() => comingSoon('Address')} />
              </View>
            </Card>

            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                Support
              </Text>
              <View className="mt-2">
                <RowItem icon="help-buoy-outline" label="Contact support" onPress={() => router.push('/(tabs)/contact')} />
                <Divider />
                <RowItem icon="logo-whatsapp" label="WhatsApp chat" onPress={() => comingSoon('WhatsApp chat')} />
                <Divider />
                <RowItem icon="help-circle-outline" label="FAQ" onPress={() => router.push('/(tabs)/services')} />
              </View>
            </Card>

            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                Security
              </Text>
              <View className="mt-2">
                <RowItem icon="phone-portrait-outline" label="Logout all devices" onPress={() => comingSoon('Logout all devices')} />
                <Divider />
                <RowItem icon="shield-checkmark-outline" label="Session management" onPress={() => comingSoon('Session management')} />
              </View>
              <View className="mt-4">
                <Button label="Logout" variant="secondary" onPress={() => void handleLogout()} />
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
