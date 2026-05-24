import { useState } from 'react';
import { Alert, Image, Keyboard, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/use-auth';
import { ApiError } from '../../lib/api';
import { appConfig } from '../../lib/config';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { loginMutation, loginWithProvider, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loginMutation.isPending) {
      return;
    }
    Keyboard.dismiss();
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      const fallbackMessage = 'Please check your credentials and try again.';
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : fallbackMessage;
      const status =
        error instanceof ApiError
          ? error.status
          : typeof error === 'object' && error && 'status' in error && typeof (error as any).status === 'number'
            ? (error as any).status
            : null;

      const details = [`${message || fallbackMessage}`];
      if (status !== null) {
        details.push(`Status: ${status}`);
      }
      details.push(`API: ${appConfig.apiUrl}`);

      Alert.alert('Login failed', details.join('\n\n'));
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader
          title={t('auth.welcome')}
          subtitle="Manage your cases, documents, and payments from one place."
          rightSlot={
            <View className="rounded-2xl bg-white/15 p-2">
              <Image
                source={require('../../assets/siamez-logo.png')}
                style={{ width: 68, height: 68, borderRadius: 34 }}
                resizeMode="contain"
                accessibilityLabel="SiamEZ logo"
              />
            </View>
          }
        />

        <Card>
          <View className="gap-3">
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
            />
            <Button
              label={showPassword ? 'Hide password' : 'Show password'}
              variant="secondary"
              size="md"
              onPress={() => setShowPassword((prev) => !prev)}
            />
            <Button label={loginMutation.isPending ? t('auth.signingIn') : t('auth.signIn')} onPress={handleLogin} />
          </View>
        </Card>

        <Card>
          <View className="gap-3">
            <Button
              label={t('auth.continueAsGuest')}
              variant="secondary"
              onPress={() => {
                continueAsGuest();
                router.replace('/(tabs)/home');
              }}
            />
            <Button
              label="G  Continue with Google"
              backgroundColor="#DB4437"
              textColor="#ffffff"
              onPress={() => loginWithProvider('google')}
            />
            <Button
              label="f  Continue with Facebook"
              backgroundColor="#1877F2"
              textColor="#ffffff"
              onPress={() => loginWithProvider('facebook')}
            />
            <Button
              label="LINE  Continue with LINE"
              backgroundColor="#06C755"
              textColor="#ffffff"
              onPress={() => loginWithProvider('line')}
            />
            <Button label={t('cta.getStarted')} onPress={() => router.push('/(auth)/signup')} />
          </View>
        </Card>

        {typeof __DEV__ !== 'undefined' && __DEV__ ? (
          <Text className="text-center text-xs leading-5" style={{ color: colors.muted }}>
            Freelancer portal demo: freelancer@example.com / Freelancer123!
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
