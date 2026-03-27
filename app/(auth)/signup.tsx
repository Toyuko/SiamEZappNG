import { useState } from 'react';
import { Alert, Keyboard, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ApiError } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/use-auth';
import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUpMutation } = useAuth();
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
      await signUpMutation.mutateAsync({ name, email, phone, password });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Unable to create account.';
      Alert.alert('Sign up failed', message);
    }
  };

  return (
    <SafeAreaView className="flex-1 p-6" style={{ backgroundColor: colors.background }}>
      <Header title={t('auth.createAccount')} subtitle="Sign up to track cases, documents, and payments." gradient />

      <Card className="mt-6">
        <View className="gap-3">
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
            autoComplete="newPassword"
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
          />
          <Button label={signUpMutation.isPending ? t('auth.creatingAccount') : t('auth.signUp')} onPress={handleSignUp} />
          <Button label={t('auth.backToLogin')} variant="secondary" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </Card>
    </SafeAreaView>
  );
}
