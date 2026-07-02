import { useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ApiError } from '../../lib/api';
import {
  AuthField,
  AuthSubmitButton,
  AuthSwitchLink,
  OrDivider,
  SocialButton,
  useAuthColors,
} from '../../components/auth/auth-ui';
import { FadeInView } from '../../components/ui/FadeInView';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/use-auth';
import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';

type AccountType = 'customer' | 'freelancer';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors, pageBackground } = useAuthColors();
  const { signUpMutation, loginWithProvider } = useAuth();
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: pageBackground }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader title={t('auth.createAccount')} subtitle="Sign up to track cases, documents, and payments." />

        <FadeInView distance={22} scaleFrom={0.98}>
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: radius.xl,
              padding: spacing.cardPadding + 4,
            }}
          >
            <SocialButton kind="google" label={t('auth.continueWithGoogle')} onPress={() => loginWithProvider('google')} />
            <SocialButton kind="line" label={t('auth.continueWithLine')} onPress={() => loginWithProvider('line')} />

            <OrDivider label={t('auth.orContinueWith')} />

            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
              {t('auth.accountType')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
              {(['customer', 'freelancer'] as const).map((type) => {
                const selected = accountType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setAccountType(type)}
                    style={{
                      flex: 1,
                      minHeight: 50,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      borderRadius: radius.button,
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? `${colors.primary}12` : colors.card,
                      paddingHorizontal: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        borderWidth: 2,
                        borderColor: selected ? colors.primary : colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selected ? (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                      ) : null}
                    </View>
                    <Text
                      style={{ fontSize: 14, fontWeight: '600', color: selected ? colors.primary : colors.muted }}
                      numberOfLines={1}
                    >
                      {type === 'customer' ? t('auth.accountTypeCustomer') : t('auth.accountTypeFreelancer')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <AuthField label={t('auth.fullName')} placeholder={t('auth.fullName')} value={name} onChangeText={setName} />
            <AuthField
              label={t('auth.email')}
              placeholder={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />
            <AuthField
              label={t('auth.phone')}
              placeholder={t('auth.phone')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <AuthField
              label={t('auth.password')}
              placeholder={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <AuthSubmitButton
              label={signUpMutation.isPending ? t('auth.creatingAccount') : t('auth.createAccount')}
              onPress={handleSignUp}
              loading={signUpMutation.isPending}
            />

            <AuthSwitchLink
              prompt={t('auth.haveAccountPrompt')}
              actionLabel={t('auth.signIn')}
              onPress={() => router.replace('/(auth)/login')}
            />
          </View>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}
