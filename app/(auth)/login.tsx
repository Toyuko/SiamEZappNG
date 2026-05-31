import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/use-auth';
import { ApiError } from '../../lib/api';
import { appConfig } from '../../lib/config';
import { t } from '../../lib/i18n/i18n';
import { radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const DEMO_FREELANCER_EMAIL = 'freelancer@example.com';
const DEMO_FREELANCER_PASSWORD = 'Freelancer123!';

const SOCIAL = {
  google: { bg: '#ffffff', border: '#e5e7eb', text: '#1f2937', iconColor: '#DB4437' },
  facebook: { bg: '#1877F2', border: '#1877F2', text: '#ffffff', iconColor: '#ffffff' },
  line: { bg: '#06C755', border: '#06C755', text: '#ffffff', iconColor: '#ffffff' },
} as const;

type SocialProvider = keyof typeof SOCIAL;

function SocialLoginButton({
  label,
  provider,
  onPress,
}: {
  label: string;
  provider: SocialProvider;
  onPress: () => void;
}) {
  const palette = SOCIAL[provider];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <View style={styles.socialIconSlot}>
        {provider === 'google' ? (
          <AntDesign name="google" size={20} color={palette.iconColor} />
        ) : provider === 'facebook' ? (
          <FontAwesome name="facebook" size={20} color={palette.iconColor} />
        ) : (
          <View style={styles.lineIconBadge}>
            <Text style={styles.lineIconText}>LINE</Text>
          </View>
        )}
      </View>
      <Text style={[styles.socialLabel, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { loginMutation, loginWithProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const cardShadow = isDark ? shadows.cardDark : shadows.cardLight;

  const themed = useMemo(
    () =>
      StyleSheet.create({
        screen: { backgroundColor: colors.background },
        card: {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        title: { color: colors.foreground },
        subtitle: { color: colors.muted },
        signInButton: { backgroundColor: colors.primary },
        signInButtonDisabled: { opacity: 0.65 },
        signInLabel: { color: '#ffffff' },
        mutedText: { color: colors.muted },
        signUpLink: { color: colors.primary },
        dividerLine: { backgroundColor: colors.border },
        dividerText: { color: colors.muted },
        demoLink: { color: colors.muted },
      }),
    [colors],
  );

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
    <SafeAreaView style={[styles.safeArea, themed.screen]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardWrapper}>
          <View style={[styles.card, themed.card, cardShadow]}>
            <View style={styles.header}>
              <Text style={[styles.title, themed.title]}>{t('auth.welcome')}</Text>
              <Text style={[styles.subtitle, themed.subtitle]}>{t('auth.welcomeSubtitle')}</Text>
            </View>

            <View style={styles.form}>
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
              <Input
                placeholder={t('auth.password')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                rightIcon={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    hitSlop={10}
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.muted}
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
                  themed.signInButton,
                  loginMutation.isPending ? themed.signInButtonDisabled : null,
                  pressed && !loginMutation.isPending ? styles.signInPressed : null,
                ]}
              >
                {loginMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={[styles.signInLabel, themed.signInLabel]}>{t('auth.signIn')}</Text>
                )}
              </Pressable>

              <Text style={[styles.signUpPrompt, themed.mutedText]}>
                {t('auth.noAccountPrompt')}{' '}
                <Text
                  style={[styles.signUpLink, themed.signUpLink]}
                  onPress={() => router.push('/(auth)/signup')}
                >
                  {t('auth.signUpHere')}
                </Text>
              </Text>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, themed.dividerLine]} />
                <Text style={[styles.dividerText, themed.dividerText]}>{t('auth.orContinueWith')}</Text>
                <View style={[styles.dividerLine, themed.dividerLine]} />
              </View>

              <View style={styles.socialGroup}>
                <SocialLoginButton
                  label={t('auth.continueWithGoogle')}
                  provider="google"
                  onPress={() => loginWithProvider('google')}
                />
                <SocialLoginButton
                  label={t('auth.continueWithFacebook')}
                  provider="facebook"
                  onPress={() => loginWithProvider('facebook')}
                />
                <SocialLoginButton
                  label={t('auth.continueWithLine')}
                  provider="line"
                  onPress={() => loginWithProvider('line')}
                />
              </View>
            </View>
          </View>
          </View>

          {typeof __DEV__ !== 'undefined' && __DEV__ ? (
            <Pressable
              accessibilityRole="link"
              onPress={fillDemoFreelancer}
              style={({ pressed }) => [styles.demoLinkWrap, pressed ? styles.demoPressed : null]}
            >
              <Text style={[styles.demoLink, themed.demoLink]}>{t('auth.demoFreelancerAccount')}</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingVertical: spacing.sectionGap,
  },
  cardWrapper: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.cardPadding,
    gap: spacing.stackLg,
  },
  header: {
    gap: spacing.stackSm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: spacing.stackMd,
  },
  signInButton: {
    minHeight: 52,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.stackSm,
  },
  signInPressed: {
    opacity: 0.9,
  },
  signInLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  signUpPrompt: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  signUpLink: {
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: spacing.stackSm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  socialGroup: {
    gap: 10,
  },
  socialButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.button,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  socialIconSlot: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  lineIconBadge: {
    minWidth: 28,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  lineIconText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoLinkWrap: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  demoPressed: {
    opacity: 0.7,
  },
  demoLink: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
