import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginPhoneFrame } from '../../components/auth/LoginPhoneFrame';
import { useAuth } from '../../hooks/use-auth';
import { ApiError } from '../../lib/api';
import { appConfig } from '../../lib/config';
import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';

const DEMO_FREELANCER_EMAIL = 'freelancer@example.com';
const DEMO_FREELANCER_PASSWORD = 'Freelancer123!';

const BRAND_BLUE = siam.blue.DEFAULT;
const SCREEN_WHITE = '#ffffff';
const TEXT_PRIMARY = '#1f2937';
const TEXT_MUTED = '#6b7280';
const BORDER = '#e5e7eb';
const GOOGLE_RED = '#DB4437';
const FACEBOOK_BLUE = '#1877F2';
const LINE_GREEN = '#06C755';

const CARD_SHADOW = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 14,
  elevation: 5,
} as const;

type AuthFieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  autoComplete?: 'email' | 'password';
  textContentType?: 'emailAddress' | 'password';
  rightElement?: ReactNode;
};

function AuthField({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoComplete,
  textContentType,
  rightElement,
}: AuthFieldProps) {
  return (
    <View style={styles.fieldShell}>
      <TextInput
        style={[styles.fieldInput, rightElement ? styles.fieldInputWithIcon : null]}
        placeholder={placeholder}
        placeholderTextColor={TEXT_MUTED}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        textContentType={textContentType}
      />
      {rightElement}
    </View>
  );
}

type StackedButtonProps = {
  label: string;
  onPress: () => void;
  variant: 'guest' | 'google' | 'facebook' | 'line';
};

function StackedAuthButton({ label, onPress, variant }: StackedButtonProps) {
  const palette = {
    guest: { bg: 'transparent', border: BRAND_BLUE, text: BRAND_BLUE, icon: null as string | null },
    google: { bg: GOOGLE_RED, border: GOOGLE_RED, text: '#ffffff', icon: 'G' },
    facebook: { bg: FACEBOOK_BLUE, border: FACEBOOK_BLUE, text: '#ffffff', icon: 'f' },
    line: { bg: LINE_GREEN, border: LINE_GREEN, text: '#ffffff', icon: 'LINE' },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.stackedButton,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {palette.icon ? (
        <View style={styles.stackedIconSlot}>
          {variant === 'line' ? (
            <Text style={styles.lineIcon}>LINE</Text>
          ) : (
            <Text style={[styles.brandLetter, { color: palette.text }]}>{palette.icon}</Text>
          )}
        </View>
      ) : null}
      <Text style={[styles.stackedLabel, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loginMutation, loginWithProvider, continueAsGuest } = useAuth();
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
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.sectionGap + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainColumn}>
            <View style={[styles.card, CARD_SHADOW]}>
              <View style={styles.logoRing}>
                <Image
                  source={require('../../assets/siamez-logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                  accessibilityLabel="SiamEZ logo"
                />
              </View>

              <Text style={styles.cardTitle}>{t('auth.welcome')}</Text>
              <Text style={styles.cardSubtitle}>{t('auth.welcomeSubtitle')}</Text>

              <View style={styles.form}>
                <AuthField
                  placeholder={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                <AuthField
                  placeholder={t('auth.password')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  rightElement={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      hitSlop={10}
                      onPress={() => setShowPassword((prev) => !prev)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color={TEXT_MUTED}
                      />
                    </Pressable>
                  }
                />

                <Pressable
                  accessibilityRole="button"
                  disabled={loginMutation.isPending}
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.signInButton,
                    loginMutation.isPending && styles.signInDisabled,
                    pressed && !loginMutation.isPending ? styles.signInPressed : null,
                  ]}
                >
                  {loginMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.signInLabel}>{t('auth.signIn')}</Text>
                  )}
                </Pressable>

                <Text style={styles.signUpPrompt}>
                  {t('auth.noAccountPrompt')}{' '}
                  <Text style={styles.signUpLink} onPress={() => router.push('/(auth)/signup')}>
                    {t('auth.signUpHere')}
                  </Text>
                </Text>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.stackedGroup}>
                  <StackedAuthButton
                    label={t('auth.continueAsGuest')}
                    variant="guest"
                    onPress={() => {
                      continueAsGuest();
                      router.replace('/(tabs)/home');
                    }}
                  />
                  <StackedAuthButton
                    label={t('auth.continueWithGoogle')}
                    variant="google"
                    onPress={() => loginWithProvider('google')}
                  />
                  <StackedAuthButton
                    label={t('auth.continueWithFacebook')}
                    variant="facebook"
                    onPress={() => loginWithProvider('facebook')}
                  />
                  <StackedAuthButton
                    label={t('auth.continueWithLine')}
                    variant="line"
                    onPress={() => loginWithProvider('line')}
                  />
                </View>
              </View>
            </View>

            {typeof __DEV__ !== 'undefined' && __DEV__ ? (
              <View style={styles.demoFooter}>
                <Text style={styles.demoDescription}>
                  {t('auth.demoFreelancerDescription', {
                    email: DEMO_FREELANCER_EMAIL,
                    password: DEMO_FREELANCER_PASSWORD,
                  })}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={fillDemoFreelancer}
                  style={({ pressed }) => [styles.demoButton, pressed ? styles.demoButtonPressed : null]}
                >
                  <Text style={styles.demoButtonLabel}>{t('auth.useDemoFreelancerAccount')}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LoginPhoneFrame>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: SCREEN_WHITE,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingBottom: spacing.sectionGap,
  },
  mainColumn: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: spacing.stackLg,
    paddingTop: spacing.stackMd,
  },
  card: {
    backgroundColor: SCREEN_WHITE,
    borderRadius: radius.xl,
    padding: spacing.cardPadding,
    gap: spacing.stackMd,
    alignSelf: 'stretch',
  },
  logoRing: {
    alignSelf: 'center',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: siam.yellow.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.stackSm,
  },
  logoImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: TEXT_MUTED,
    marginBottom: spacing.stackSm,
  },
  form: {
    gap: 12,
  },
  fieldShell: {
    position: 'relative',
    justifyContent: 'center',
  },
  fieldInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: radius.button,
    backgroundColor: SCREEN_WHITE,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  fieldInputWithIcon: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    height: 52,
    justifyContent: 'center',
  },
  signInButton: {
    minHeight: 52,
    borderRadius: radius.button,
    backgroundColor: BRAND_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  signInDisabled: {
    opacity: 0.65,
  },
  signInPressed: {
    opacity: 0.92,
  },
  signInLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  signUpPrompt: {
    textAlign: 'center',
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  signUpLink: {
    color: BRAND_BLUE,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  stackedGroup: {
    gap: 10,
  },
  stackedButton: {
    minHeight: 52,
    borderRadius: radius.button,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  stackedIconSlot: {
    position: 'absolute',
    left: 16,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackedLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  brandLetter: {
    fontSize: 20,
    fontWeight: '700',
  },
  lineIcon: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  demoFooter: {
    alignItems: 'center',
    gap: 12,
    paddingTop: spacing.stackSm,
    paddingBottom: spacing.stackMd,
  },
  demoDescription: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: TEXT_MUTED,
    paddingHorizontal: 8,
  },
  demoButton: {
    alignSelf: 'stretch',
    minHeight: 48,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: BRAND_BLUE,
    backgroundColor: SCREEN_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  demoButtonPressed: {
    opacity: 0.85,
  },
  demoButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND_BLUE,
  },
});
