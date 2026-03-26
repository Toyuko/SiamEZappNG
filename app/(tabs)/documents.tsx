import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { useDocuments } from '../../hooks/use-documents';

export default function DocumentsScreen() {
  const { data, isLoading, isError, refetch, error } = useDocuments();

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (!result.canceled) {
      Alert.alert('Selected file', result.assets[0]?.name ?? 'Unknown');
    }
  };

  const capturePhoto = async () => {
    const permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert('Permission required', 'Camera access is needed to capture document photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      Alert.alert('Photo captured', 'Ready to upload payment proof or case document.');
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading documents..." />;
  }

  if (isError) {
    return <ErrorState label={error instanceof Error ? error.message : 'Unable to load documents.'} onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold text-slate-900">Documents</Text>
      <Text className="mt-1 text-slate-500">Upload and attach documents to your active cases.</Text>

      <View className="mt-5 gap-3">
        <Pressable className="rounded-xl bg-blue-700 px-4 py-3" onPress={pickFile}>
          <Text className="text-center font-semibold text-white">Upload from Files</Text>
        </Pressable>
        <Pressable className="rounded-xl border border-slate-300 bg-white px-4 py-3" onPress={capturePhoto}>
          <Text className="text-center font-semibold text-slate-700">Capture with Camera</Text>
        </Pressable>
      </View>

      <View className="mt-5 gap-3">
        {(data ?? []).length === 0 ? (
          <EmptyState label="No documents uploaded yet." />
        ) : (
          data?.map((document) => (
            <View key={document.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="font-semibold text-slate-900">{document.name}</Text>
              <Text className="mt-1 text-slate-500">{document.type}</Text>
              <Text className="mt-2 text-xs text-slate-400">
                {new Date(document.uploadedAt).toLocaleDateString()} - {document.status}
              </Text>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}
