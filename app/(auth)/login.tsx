import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuth } from '../../hooks/use-auth';
import { ApiError } from '../../lib/api';
import { appConfig } from '../../lib/config';

export default function LoginScreen() {
  const router = useRouter();
  const { loginMutation, loginWithProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync({ email, password });
      router.replace('/(tabs)/home');
    } catch (error) {
      const details =
        error instanceof ApiError
          ? `\n\nStatus: ${error.status}\nAPI: ${appConfig.apiUrl}`
          : '';
      Alert.alert('Login failed', `Please check your credentials and try again.${details}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-6">
      <View className="mt-12 gap-2">
        <Text className="text-3xl font-bold text-slate-900">Welcome to SiamEZ</Text>
        <Text className="text-slate-500">Manage your cases, documents, and payments from one place.</Text>
      </View>

      <View className="mt-8 gap-3">
        <TextInput
          className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable className="rounded-xl bg-blue-700 px-4 py-3" onPress={handleLogin}>
          <Text className="text-center font-semibold text-white">
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </Text>
        </Pressable>
      </View>

      <View className="mt-8 gap-3">
        <Pressable className="rounded-xl border border-slate-300 bg-white px-4 py-3" onPress={() => loginWithProvider('google')}>
          <Text className="text-center font-semibold text-slate-700">Continue with Google</Text>
        </Pressable>
        <Pressable className="rounded-xl border border-slate-300 bg-white px-4 py-3" onPress={() => loginWithProvider('facebook')}>
          <Text className="text-center font-semibold text-slate-700">Continue with Facebook</Text>
        </Pressable>
        <Pressable className="rounded-xl border border-slate-300 bg-white px-4 py-3" onPress={() => loginWithProvider('line')}>
          <Text className="text-center font-semibold text-slate-700">Continue with LINE</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
