import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Section } from '../../components/ui/Section';
import { useCreateBooking } from '../../hooks/use-create-booking';
import { useUploadDocument } from '../../hooks/use-upload-document';
import { useAuthStore } from '../../store/auth-store';
import { serviceCatalog } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';

type WizardStep = 1 | 2 | 3 | 4 | 5;
type UploadedDoc = { id: string; name: string };

const stepLabels: Record<WizardStep, string> = {
  1: t('book.serviceInfo'),
  2: t('book.clientDetails'),
  3: t('book.requirements'),
  4: t('book.review'),
  5: t('book.confirmation'),
};

const requirementTemplates: Record<string, string[]> = {
  'translation-services': ['Document Type', 'Target Language'],
  'visa-services': ['Visa Type', 'Current Visa Status'],
  'marriage-registration': ['Nationality', 'Current Marital Status'],
  'driver-license': ['License Type', 'Current License Status'],
  'police-clearance': ['Purpose of Certificate', 'Destination Country'],
};

export default function BookScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { service, serviceSlug } = useLocalSearchParams<{ service?: string; serviceSlug?: string }>();
  const { isGuest, guestProfile, user, updateGuestProfile, accessToken } = useAuthStore();
  const bookingMutation = useCreateBooking();
  const uploadMutation = useUploadDocument();
  const [step, setStep] = useState<WizardStep>(1);
  const [fullName, setFullName] = useState(isGuest ? guestProfile?.name ?? '' : user?.name ?? '');
  const [email, setEmail] = useState(isGuest ? guestProfile?.email ?? '' : user?.email ?? '');
  const [phone, setPhone] = useState(isGuest ? guestProfile?.phone ?? '' : '');
  const [documentType, setDocumentType] = useState('');
  const [notes, setNotes] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [visaType, setVisaType] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDoc[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const transition = useRef(new Animated.Value(1)).current;

  const selectedService = useMemo(() => {
    if (serviceSlug) {
      const bySlug = serviceCatalog.find((item) => item.slug === serviceSlug);
      if (bySlug) {
        return bySlug;
      }
    }
    if (service) {
      return serviceCatalog.find((item) => item.title.toLowerCase() === service.toLowerCase()) ?? serviceCatalog[0];
    }
    return serviceCatalog[0];
  }, [service, serviceSlug]);

  const dynamicRequirementFields = requirementTemplates[selectedService.slug] ?? ['Document Type'];
  const progressWidth = `${(step / 5) * 100}%` as const;

  useEffect(() => {
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [step, transition]);

  const validateCurrentStep = () => {
    const nextErrors: Record<string, string> = {};
    if (step === 2) {
      if (!fullName.trim()) {
        nextErrors.fullName = t('book.requiredFullName');
      }
      if (!email.trim()) {
        nextErrors.email = t('book.requiredEmail');
      }
      if (!phone.trim()) {
        nextErrors.phone = t('book.requiredPhone');
      }
    }
    if (step === 3) {
      if (!documentType.trim()) {
        nextErrors.documentType = t('book.requiredDocumentType');
      }
      if (dynamicRequirementFields.includes('Target Language') && !targetLanguage.trim()) {
        nextErrors.targetLanguage = t('book.requiredTargetLanguage');
      }
      if (dynamicRequirementFields.includes('Visa Type') && !visaType.trim()) {
        nextErrors.visaType = t('book.requiredVisaType');
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setStep((prev) => (prev < 5 ? ((prev + 1) as WizardStep) : prev));
  };

  const goBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
    setErrors({});
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (result.canceled) {
      return;
    }
    const asset = result.assets[0];
    if (!asset?.uri) {
      return;
    }
    try {
      const uploaded = await uploadMutation.mutateAsync({
        uri: asset.uri,
        name: asset.name ?? 'document',
        mimeType: asset.mimeType ?? undefined,
      });
      setUploadedDocuments((prev) => [...prev, { id: uploaded.id, name: uploaded.name }]);
    } catch (error) {
      Alert.alert(t('book.uploadFailed'), error instanceof Error ? error.message : t('book.retryMessage'));
    }
  };

  const takePhoto = async () => {
    const permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert(t('book.permissionRequired'), t('book.cameraAccessNeeded'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled) {
      return;
    }
    const asset = result.assets[0];
    if (!asset?.uri) {
      return;
    }
    try {
      const uploaded = await uploadMutation.mutateAsync({
        uri: asset.uri,
        name: 'camera-upload.jpg',
        mimeType: 'image/jpeg',
      });
      setUploadedDocuments((prev) => [...prev, { id: uploaded.id, name: uploaded.name }]);
    } catch (error) {
      Alert.alert(t('book.uploadFailed'), error instanceof Error ? error.message : t('book.retryMessage'));
    }
  };

  const submitBooking = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    const details = {
      documentType,
      notes,
      targetLanguage: targetLanguage || undefined,
      visaType: visaType || undefined,
      requirements: dynamicRequirementFields,
    };
    const payload = {
      serviceId: selectedService.slug,
      userId: accessToken && user?.id ? user.id : undefined,
      guestName: fullName,
      guestEmail: email,
      guestPhone: phone,
      details,
      documents: uploadedDocuments.map((doc) => doc.id),
    };
    try {
      await bookingMutation.mutateAsync(payload);
      if (isGuest) {
        updateGuestProfile({ name: fullName, email, phone });
      }
      setSubmitted(true);
      setStep(5);
    } catch (error) {
      Alert.alert(t('book.bookingFailed'), error instanceof Error ? error.message : t('book.retryMessage'));
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <Section title={`Book: ${selectedService.title}`} subtitle={selectedService.shortDescription}>
          <Card>
            <Text className="text-sm" style={{ color: colors.mutedText }}>{t('book.serviceSummary')}</Text>
            <Text className="mt-1 text-base font-semibold" style={{ color: colors.text }}>{selectedService.title}</Text>
            <Text className="mt-1" style={{ color: colors.mutedText }}>{selectedService.fullDescription}</Text>
            <Text className="mt-3 text-xs" style={{ color: colors.mutedText }}>{t('book.quoteNote')}</Text>
          </Card>
          <Button label={t('book.changeService')} variant="secondary" onPress={() => router.push('/(tabs)/services')} />
        </Section>
      );
    }

    if (step === 2) {
      return (
        <Section title={t('book.clientDetails')}>
          <Input placeholder={t('auth.fullName')} value={fullName} onChangeText={setFullName} error={errors.fullName} />
          <Input placeholder={t('auth.email')} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} error={errors.email} />
          <Input placeholder={t('auth.phone')} keyboardType="phone-pad" value={phone} onChangeText={setPhone} error={errors.phone} />
        </Section>
      );
    }

    if (step === 3) {
      return (
        <Section title={t('book.requirements')}>
          <Input placeholder={dynamicRequirementFields.includes('Document Type') ? 'Document Type' : 'Requirement'} value={documentType} onChangeText={setDocumentType} error={errors.documentType} />
          {dynamicRequirementFields.includes('Target Language') ? (
            <>
              <Input placeholder={t('book.targetLanguage')} value={targetLanguage} onChangeText={setTargetLanguage} error={errors.targetLanguage} />
            </>
          ) : null}
          {dynamicRequirementFields.includes('Visa Type') ? (
            <>
              <Input placeholder={t('book.visaType')} value={visaType} onChangeText={setVisaType} error={errors.visaType} />
            </>
          ) : null}
          <Input placeholder={t('book.notes')} multiline value={notes} onChangeText={setNotes} />

          <Card>
            <Text className="font-semibold" style={{ color: colors.text }}>{t('book.documents')}</Text>
            <Text className="mt-1" style={{ color: colors.mutedText }}>{t('book.uploadFromFilesOrCamera')}</Text>
            <View className="mt-3 flex-row gap-2">
              <View className="flex-1">
                <Button label={t('book.uploadFile')} onPress={() => void pickFile()} disabled={uploadMutation.isPending} />
              </View>
              <View className="flex-1">
                <Button label={t('book.camera')} variant="secondary" onPress={() => void takePhoto()} disabled={uploadMutation.isPending} />
              </View>
            </View>
            {uploadedDocuments.length > 0 ? (
              <View className="mt-3 gap-2">
                {uploadedDocuments.map((doc) => (
                  <Text key={doc.id} style={{ color: colors.mutedText }}>
                    • {doc.name}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        </Section>
      );
    }

    if (step === 4) {
      return (
        <Section title={t('book.review')}>
          <Card>
            <Text className="text-sm" style={{ color: colors.mutedText }}>{t('book.service')}</Text>
            <Text className="font-semibold" style={{ color: colors.text }}>{selectedService.title}</Text>
            <Text className="mt-3 text-sm" style={{ color: colors.mutedText }}>{t('book.client')}</Text>
            <Text style={{ color: colors.text }}>{fullName}</Text>
            <Text style={{ color: colors.text }}>{email}</Text>
            <Text style={{ color: colors.text }}>{phone}</Text>
            <Text className="mt-3 text-sm" style={{ color: colors.mutedText }}>{t('book.requirements')}</Text>
            <Text style={{ color: colors.text }}>{t('book.documentType')}: {documentType}</Text>
            {targetLanguage ? <Text style={{ color: colors.text }}>{t('book.targetLanguage')}: {targetLanguage}</Text> : null}
            {visaType ? <Text style={{ color: colors.text }}>{t('book.visaType')}: {visaType}</Text> : null}
            {notes ? <Text style={{ color: colors.text }}>{t('book.notes')}: {notes}</Text> : null}
            <Text className="mt-2" style={{ color: colors.text }}>{t('book.documentsCount', { count: uploadedDocuments.length })}</Text>
          </Card>
          <Button label={t('book.editDetails')} variant="secondary" onPress={() => setStep(2)} />
        </Section>
      );
    }

    return (
      <Card className="mt-10">
        <Text className="text-xl font-bold" style={{ color: colors.success }}>{t('book.bookingSubmitted')}</Text>
        <Text className="mt-2" style={{ color: colors.text }}>{t('book.bookingSubmittedSubtitle')}</Text>
        <View className="mt-4 gap-3">
          {isGuest ? (
            <Button label={t('book.createAccount')} onPress={() => router.replace('/(auth)/signup')} />
          ) : (
            <Button label={t('book.viewDashboard')} onPress={() => router.replace('/(tabs)/dashboard')} />
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Header title={t('book.title')} subtitle={t('book.stepOf', { step, label: stepLabels[step] })} gradient />
        <View className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: colors.border }}>
          <View className="h-2 rounded-full" style={{ width: progressWidth, backgroundColor: colors.primary }} />
        </View>

        <Animated.View style={{ opacity: transition, transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
          {renderStepContent()}
        </Animated.View>

        {!submitted ? (
          <View className="mt-2 flex-row gap-2">
            <View className="flex-1">
              <Button label={t('common.back')} variant="secondary" onPress={goBack} disabled={step === 1} />
            </View>
            {step < 4 ? (
              <View className="flex-1">
                <Button label={t('common.next')} onPress={goNext} />
              </View>
            ) : step === 4 ? (
              <View className="flex-1">
                <Button label={bookingMutation.isPending ? t('book.submitting') : t('book.submitBooking')} onPress={() => void submitBooking()} disabled={bookingMutation.isPending} />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
