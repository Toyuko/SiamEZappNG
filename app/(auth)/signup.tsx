import { useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ApiError } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/use-auth';
import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type AccountType = 'customer' | 'freelancer';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUpMutation } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (signUpMutation.isPending) {
      return;
    }
    Keyboard.dismiss();
    try {
      await signUpMutation.mutateAsync({ name, email, phone, password, accountType });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Unable to create account.';
      Alert.alert('Sign up failed', message);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader title={t('auth.createAccount')} subtitle="Sign up to track cases, documents, and payments." />

        <Card>
          <View className="gap-3">
            <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
              {t('auth.accountType')}
            </Text>
            <View className="flex-row gap-3">
              {(['customer', 'freelancer'] as const).map((type) => {
                const selected = accountType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setAccountType(type)}
                    style={{
                      flex: 1,
                      minHeight: 48,
                      borderRadius: radius.lg,
                      borderWidth: 2,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? `${colors.primary}12` : colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text className="text-sm font-semibold" style={{ color: selected ? colors.primary : colors.muted }}>
                      {type === 'customer' ? t('auth.accountTypeCustomer') : t('auth.accountTypeFreelancer')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input placeholder={t('auth.fullName')} value={name} onChangeText={setName} />
            <Input
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              placeholder={t('auth.email')}
              value={email}
              onChangeText={setEmail}
            />
            <Input keyboardType="phone-pad" placeholder={t('auth.phone')} value={phone} onChangeText={setPhone} />
            <Input
              placeholder={t('auth.password')}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
            />
            <Button label={signUpMutation.isPending ? t('auth.creatingAccount') : t('cta.getStarted')} onPress={handleSignUp} />
            <Button label={t('auth.backToLogin')} variant="secondary" onPress={() => router.replace('/(auth)/login')} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
