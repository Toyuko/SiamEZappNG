import { useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ApiError } from '../../lib/api';
import {
  AuthField,
  AuthLogo,
  AuthSubmitButton,
  AuthSwitchLink,
  OrDivider,
  SocialButton,
  useAuthColors,
} from '../../components/auth/auth-ui';
import { FadeInView } from '../../components/ui/FadeInView';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/use-auth';
import { useSoftLaunch } from '../../hooks/use-soft-launch';
import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';

type AccountType = 'customer' | 'freelancer' | 'corporate';

function accountTypeLabel(type: AccountType) {
  if (type === 'customer') {
    return t('auth.accountTypeCustomer');
  }
  if (type === 'freelancer') {
    return t('auth.accountTypeFreelancer');
  }
  return t('auth.accountTypeCorporate');
}

function isValidEmail(value: string) {
  const trimmed = value.trim();
  return trimmed.includes('@') && trimmed.includes('.') && !trimmed.startsWith('@');
}

export default function SignUpScreen() {
  const router = useRouter();
  const softLaunch = useSoftLaunch();
  const { colors, pageBackground } = useAuthColors();
  const { signUpMutation, loginWithProvider, continueAsGuest } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const availableAccountTypes: AccountType[] = softLaunch.enabled
    ? [
        'customer' as const,
        ...(softLaunch.showFreelancers ? (['freelancer'] as const) : []),
        ...(softLaunch.showCompanies ? (['corporate'] as const) : []),
      ]
    : (['customer', 'freelancer', 'corporate'] as const);
  const showAccountTypePicker = availableAccountTypes.length > 1;

  const handleSignUp = async () => {
    if (signUpMutation.isPending) {
      return;
    }
    Keyboard.dismiss();
    if (!name.trim()) {
      Alert.alert(t('auth.signupFailed'), t('contact.fullNameRequired'));
      return;
    }
    if (!email.trim()) {
      Alert.alert(t('auth.signupFailed'), t('contact.emailRequired'));
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert(t('auth.signupFailed'), t('contact.emailInvalid'));
      return;
    }
    if (password.length < 8) {
      Alert.alert(t('auth.signupFailed'), t('auth.passwordTooShort'));
      return;
    }
    try {
      let resolvedType: AccountType = accountType;
      if (softLaunch.enabled) {
        if (accountType === 'freelancer' && softLaunch.showFreelancers) {
          resolvedType = 'freelancer';
        } else if (accountType === 'corporate' && softLaunch.showCompanies) {
          resolvedType = 'corporate';
        } else {
          resolvedType = 'customer';
        }
      }
      await signUpMutation.mutateAsync({ name, email, phone, password, accountType: resolvedType });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Unable to create account.';
      Alert.alert(t('auth.signupFailed'), message);
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
            <View style={{ marginBottom: 16 }}>
              <AuthLogo />
            </View>
            <SocialButton kind="google" label={t('auth.continueWithGoogle')} onPress={() => loginWithProvider('google')} />
            <SocialButton kind="line" label={t('auth.continueWithLine')} onPress={() => loginWithProvider('line')} />
            <SocialButton kind="facebook" label={t('auth.continueWithFacebook')} onPress={() => loginWithProvider('facebook')} />
            <SocialButton
              kind="guest"
              label={t('auth.continueAsGuest')}
              onPress={() => {
                continueAsGuest();
                router.replace('/(tabs)/services');
              }}
            />

            <OrDivider label={t('auth.orContinueWith')} />

            {showAccountTypePicker ? (
              <>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                  {t('auth.accountType')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  {availableAccountTypes.map((type) => {
                    const selected = accountType === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => setAccountType(type)}
                        style={{
                          flexGrow: 1,
                          flexBasis: '30%',
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
                          {accountTypeLabel(type)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

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
