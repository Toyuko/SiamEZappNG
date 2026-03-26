import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuth } from '../../hooks/use-auth';
import { useAuthStore } from '../../store/auth-store';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold text-slate-900">Profile</Text>
      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-sm text-slate-500">Signed in as</Text>
        <Text className="mt-1 font-semibold text-slate-900">{user?.email ?? 'Unknown user'}</Text>
      </View>
      <Pressable className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3" onPress={() => void handleLogout()}>
        <Text className="text-center font-semibold text-red-600">Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}
