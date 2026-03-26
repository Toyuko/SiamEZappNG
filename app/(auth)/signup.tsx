import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ApiError } from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUpMutation } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      await signUpMutation.mutateAsync({ name, email, phone, password });
      router.replace('/(tabs)/home');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Unable to create account.';
      Alert.alert('Sign up failed', message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-6">
      <View className="mt-10 gap-2">
        <Text className="text-3xl font-bold text-slate-900">Create your account</Text>
        <Text className="text-slate-500">Sign up to track cases, documents, and payments.</Text>
      </View>

      <View className="mt-8 gap-3">
        <TextInput className="rounded-xl border border-slate-300 bg-white px-4 py-3" placeholder="Full name" value={name} onChangeText={setName} />
        <TextInput
          className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput className="rounded-xl border border-slate-300 bg-white px-4 py-3" keyboardType="phone-pad" placeholder="Phone" value={phone} onChangeText={setPhone} />
        <TextInput
          className="rounded-xl border border-slate-300 bg-white px-4 py-3"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable className="rounded-xl bg-blue-700 px-4 py-3" onPress={handleSignUp}>
          <Text className="text-center font-semibold text-white">{signUpMutation.isPending ? 'Creating account...' : 'Sign Up'}</Text>
        </Pressable>
        <Pressable className="rounded-xl border border-slate-300 bg-white px-4 py-3" onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-center font-semibold text-slate-700">Back to Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
