import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginPhoneFrame } from '../../components/auth/LoginPhoneFrame';
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
import { useAuth } from '../../hooks/use-auth';
import { useLaunchAnimation } from '../../hooks/use-launch-animation';
import { ApiError } from '../../lib/api';
import { appConfig } from '../../lib/config';
import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';

const DEMO_FREELANCER_EMAIL = 'freelancer@example.com';
const DEMO_FREELANCER_PASSWORD = 'Freelancer123!';

const CARD_SHADOW = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 6,
} as const;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, pageBackground } = useAuthColors();
  const { loginMutation, loginWithProvider, continueAsGuest } = useAuth();
  const { launchComplete } = useLaunchAnimation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fillDemoFreelancer = () => {
    setEmail(DEMO_FREELANCER_EMAIL);
    setPassword(DEMO_FREELANCER_PASSWORD);
  };

  const handleLogin = async () => {
    if (loginMutation.isPending) {
      return;
    }
    Keyboard.dismiss();
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      const fallbackMessage = t('auth.loginFailedMessage');
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : fallbackMessage;
      const status =
        error instanceof ApiError
          ? error.status
          : typeof error === 'object' && error && 'status' in error && typeof (error as { status: unknown }).status === 'number'
            ? (error as { status: number }).status
            : null;

      const details = [`${message || fallbackMessage}`];
      if (status !== null) {
        details.push(`Status: ${status}`);
      }
      details.push(`API: ${appConfig.apiUrl}`);

      Alert.alert(t('auth.loginFailed'), details.join('\n\n'));
    }
  };

  return (
    <LoginPhoneFrame>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: pageBackground }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: spacing.screenPaddingX,
            paddingVertical: spacing.sectionGap,
            paddingBottom: spacing.sectionGap + insets.bottom,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {launchComplete ? (
            <FadeInView distance={22} scaleFrom={0.98}>
              <View
                style={{
                  alignSelf: 'center',
                  width: '100%',
                  maxWidth: 440,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: radius.xl,
                  padding: spacing.cardPadding + 4,
                  ...CARD_SHADOW,
                }}
              >
                <AuthLogo />
                <Text
                  style={{ textAlign: 'center', fontSize: 24, fontWeight: '700', color: colors.foreground, marginTop: 16 }}
                >
                  {t('auth.welcome')}
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 6, marginBottom: 18 }}>
                  {t('auth.welcomeSubtitle')}
                </Text>

                <SocialButton kind="google-outline" label={t('auth.continueWithGoogle')} onPress={() => loginWithProvider('google')} />
                <SocialButton kind="line" label={t('auth.continueWithLine')} onPress={() => loginWithProvider('line')} />
                <SocialButton kind="facebook" label={t('auth.continueWithFacebook')} onPress={() => loginWithProvider('facebook')} />
                <SocialButton
                  kind="guest"
                  label={t('auth.continueAsGuest')}
                  onPress={() => {
                    continueAsGuest();
                    router.replace('/(tabs)/home');
                  }}
                />

                <OrDivider label={t('auth.orContinueWith')} />

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
                  label={t('auth.password')}
                  placeholder={t('auth.password')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  rightElement={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      hitSlop={10}
                      onPress={() => setShowPassword((prev) => !prev)}
                    >
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.muted} />
                    </Pressable>
                  }
                />

                <AuthSubmitButton label={t('auth.signIn')} onPress={handleLogin} loading={loginMutation.isPending} />

                <AuthSwitchLink
                  prompt={t('auth.noAccountPrompt')}
                  actionLabel={t('auth.signUpHere')}
                  onPress={() => router.push('/(auth)/signup')}
                />
              </View>
            </FadeInView>
          ) : (
            <View style={{ height: 1, opacity: 0 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
          )}

          {typeof __DEV__ !== 'undefined' && __DEV__ ? (
            <View style={{ alignItems: 'center', gap: 10, marginTop: spacing.stackLg }}>
              <Text style={{ textAlign: 'center', fontSize: 12, lineHeight: 18, color: colors.muted, paddingHorizontal: 8 }}>
                {t('auth.demoFreelancerDescription', {
                  email: DEMO_FREELANCER_EMAIL,
                  password: DEMO_FREELANCER_PASSWORD,
                })}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={fillDemoFreelancer}
                style={({ pressed }) => ({
                  alignSelf: 'center',
                  minHeight: 44,
                  paddingHorizontal: 18,
                  borderRadius: radius.button,
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                  backgroundColor: colors.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                  {t('auth.useDemoFreelancerAccount')}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </LoginPhoneFrame>
  );
}
