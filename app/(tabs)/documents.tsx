import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { Header } from '../../components/ui/Header';
import { LoadingState } from '../../components/ui/loading-state';
import { useDocuments } from '../../hooks/use-documents';
import { useUploadDocument } from '../../hooks/use-upload-document';
import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';

export default function DocumentsScreen() {
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch, error } = useDocuments();
  const uploadMutation = useUploadDocument();

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (!result.canceled) {
      const asset = result.assets[0];
      if (!asset?.uri) {
        return;
      }
      try {
        await uploadMutation.mutateAsync({
          uri: asset.uri,
          name: asset.name ?? 'document',
          mimeType: asset.mimeType ?? undefined,
        });
        Alert.alert(t('documents.uploaded'), t('documents.uploadDocSuccess'));
      } catch {
        Alert.alert(t('documents.uploadFailed'), t('documents.retryMessage'));
      }
    }
  };

  const capturePhoto = async () => {
    const permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert(t('documents.permissionRequired'), t('documents.cameraAccessRequired'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      const asset = result.assets[0];
      if (!asset?.uri) {
        return;
      }
      try {
        await uploadMutation.mutateAsync({
          uri: asset.uri,
          name: 'camera-upload.jpg',
          mimeType: 'image/jpeg',
        });
        Alert.alert(t('documents.uploaded'), t('documents.uploadPhotoSuccess'));
      } catch {
        Alert.alert(t('documents.uploadFailed'), t('documents.retryMessage'));
      }
    }
  };

  if (isLoading) {
    return <LoadingState label={t('documents.loading')} />;
  }

  if (isError) {
    return <ErrorState label={error instanceof Error ? error.message : t('documents.loadError')} onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaView className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
      <Header title={t('documents.title')} subtitle={t('documents.subtitle')} gradient />

      <View className="mt-5 gap-3">
        <Button label={t('documents.uploadFiles')} onPress={pickFile} disabled={uploadMutation.isPending} />
        <Button label={t('documents.captureCamera')} variant="secondary" onPress={capturePhoto} disabled={uploadMutation.isPending} />
      </View>

      <View className="mt-5 gap-3">
        {(data ?? []).length === 0 ? (
          <EmptyState label={t('documents.empty')} />
        ) : (
          data?.map((document) => (
            <Card key={document.id}>
              <Text className="font-semibold" style={{ color: colors.text }}>{document.name}</Text>
              <Text className="mt-1" style={{ color: colors.mutedText }}>{document.type}</Text>
              <Text className="mt-2 text-xs" style={{ color: colors.mutedText }}>
                {new Date(document.uploadedAt).toLocaleDateString()} - {document.status}
              </Text>
            </Card>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}
