import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuth } from '../../hooks/use-auth';
import { ApiError } from '../../lib/api';
import { appConfig } from '../../lib/config';

export default function LoginScreen() {
  const router = useRouter();
  const { loginMutation, loginWithProvider, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync({ email, password });
      router.replace('/(tabs)/home');
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
        <Pressable
          className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          onPress={() => {
            continueAsGuest();
            router.replace('/(tabs)/home');
          }}
        >
          <Text className="text-center font-semibold text-slate-700">Continue as Guest</Text>
        </Pressable>
        <Pressable className="rounded-xl border border-slate-300 bg-white px-4 py-3" onPress={() => loginWithProvider('google')}>
          <Text className="text-center font-semibold text-slate-700">Continue with Google</Text>
        </Pressable>
        <Pressable className="rounded-xl border border-slate-300 bg-white px-4 py-3" onPress={() => loginWithProvider('facebook')}>
          <Text className="text-center font-semibold text-slate-700">Continue with Facebook</Text>
        </Pressable>
        <Pressable className="rounded-xl border border-slate-300 bg-white px-4 py-3" onPress={() => loginWithProvider('line')}>
          <Text className="text-center font-semibold text-slate-700">Continue with LINE</Text>
        </Pressable>
        <Pressable className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-3" onPress={() => router.push('/(auth)/signup')}>
          <Text className="text-center font-semibold text-blue-700">Sign Up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
