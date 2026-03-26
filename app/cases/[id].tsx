import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold text-slate-900">Case Detail</Text>
      <Text className="mt-2 text-slate-500">Case ID: {id}</Text>

      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="font-semibold text-slate-900">Phase 1 foundation</Text>
        <Text className="mt-2 text-slate-500">
          Timeline, documents, notes, and assigned staff sections should connect to existing backend detail endpoint.
        </Text>
      </View>
    </SafeAreaView>
  );
}
