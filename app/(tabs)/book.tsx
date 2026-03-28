import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import { SelectField } from '../../components/ui/SelectField';
import {
  getBookingFieldsForSlug,
  getServiceStartingPriceLine,
  toSelectOptions,
  type BookingReqFieldId,
} from '../../features/bookings/booking-fields';
import { serviceCatalog } from '../../features/services/services.data';
import { useCreateBooking } from '../../hooks/use-create-booking';
import { useUploadDocument } from '../../hooks/use-upload-document';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

const BOOKING_DRAFT_PREFIX = '@booking-draft:';
const WHATSAPP_BOOKING_URL = 'https://wa.me/66643438768';

type WizardStep = 1 | 2 | 3;
type UploadedDoc = { id: string; name: string };

type BookingDraft = {
  step?: WizardStep;
  fullName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  req?: Partial<Record<BookingReqFieldId, string>>;
};

export default function BookScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { service, serviceSlug } = useLocalSearchParams<{ service?: string; serviceSlug?: string }>();
  const { isGuest, guestProfile, user, updateGuestProfile, accessToken } = useAuthStore();
  const bookingMutation = useCreateBooking();
  const uploadMutation = useUploadDocument();

  const [step, setStep] = useState<WizardStep>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [req, setReq] = useState<Partial<Record<BookingReqFieldId, string>>>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDoc[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
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

  const requirementFields = useMemo(() => getBookingFieldsForSlug(selectedService.slug), [selectedService.slug]);
  const startingPriceLine = useMemo(() => getServiceStartingPriceLine(selectedService, t), [selectedService]);
  const progressPercent = `${(step / 3) * 100}%` as const;

  const stepTitle = step === 1 ? t('book.clientDetails') : step === 2 ? t('book.serviceRequirements') : t('book.reviewConfirm');

  useEffect(() => {
    let cancelled = false;
    setDraftReady(false);
    void (async () => {
      const key = `${BOOKING_DRAFT_PREFIX}${selectedService.slug}`;
      const raw = await AsyncStorage.getItem(key);
      if (cancelled) {
        return;
      }
      setSubmitted(false);
      if (raw) {
        try {
          const d = JSON.parse(raw) as BookingDraft;
          const s = d.step ?? 1;
          setStep((s >= 1 && s <= 3 ? s : 1) as WizardStep);
          setFullName(d.fullName ?? '');
          setEmail(d.email ?? '');
          setPhone(d.phone ?? '');
          setNotes(d.notes ?? '');
          setReq(d.req ?? {});
        } catch {
          setStep(1);
          setFullName(isGuest ? guestProfile?.name ?? '' : user?.name ?? '');
          setEmail(isGuest ? guestProfile?.email ?? '' : user?.email ?? '');
          setPhone(isGuest ? guestProfile?.phone ?? '' : '');
          setNotes('');
          setReq({});
        }
      } else {
        setStep(1);
        setFullName(isGuest ? guestProfile?.name ?? '' : user?.name ?? '');
        setEmail(isGuest ? guestProfile?.email ?? '' : user?.email ?? '');
        setPhone(isGuest ? guestProfile?.phone ?? '' : '');
        setNotes('');
        setReq({});
        setUploadedDocuments([]);
      }
      setDraftReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedService.slug]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }
    setFullName((v) => v || (isGuest ? guestProfile?.name ?? '' : user?.name ?? '') || v);
    setEmail((v) => v || (isGuest ? guestProfile?.email ?? '' : user?.email ?? '') || v);
    setPhone((v) => v || (isGuest ? guestProfile?.phone ?? '' : '') || v);
  }, [draftReady, isGuest, guestProfile?.name, guestProfile?.email, guestProfile?.phone, user?.name, user?.email]);

  useEffect(() => {
    if (!draftReady || submitted) {
      return;
    }
    const key = `${BOOKING_DRAFT_PREFIX}${selectedService.slug}`;
    const payload: BookingDraft = { step, fullName, email, phone, notes, req };
    void AsyncStorage.setItem(key, JSON.stringify(payload));
  }, [draftReady, submitted, selectedService.slug, step, fullName, email, phone, notes, req]);

  useEffect(() => {
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [step, transition]);

  const setReqField = (id: BookingReqFieldId, value: string) => {
    setReq((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const validateStep1 = () => {
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      nextErrors.fullName = t('book.requiredFullName');
    }
    if (!email.trim()) {
      nextErrors.email = t('book.requiredEmail');
    }
    if (!phone.trim()) {
      nextErrors.phone = t('book.requiredPhone');
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep2 = () => {
    const nextErrors: Record<string, string> = {};
    for (const field of requirementFields) {
      const val = req[field.id];
      if (!val?.trim()) {
        nextErrors[field.id] = t('book.requiredSelection');
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (step === 1) {
      if (!validateStep1()) {
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!validateStep2()) {
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep);
      setErrors({});
    }
  };

  const openWhatsApp = async () => {
    const canOpen = await Linking.canOpenURL(WHATSAPP_BOOKING_URL);
    if (!canOpen) {
      Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
      return;
    }
    await Linking.openURL(WHATSAPP_BOOKING_URL);
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
    if (!validateStep1() || !validateStep2()) {
      return;
    }
    const details: Record<string, unknown> = {
      documentType: req.documentType ?? '',
      notes: notes.trim() || undefined,
      targetLanguage: req.targetLanguage,
      visaType: req.visaType,
      visaStatus: req.visaStatus,
      nationality: req.nationality,
      maritalStatus: req.maritalStatus,
      licenseType: req.licenseType,
      licenseStatus: req.licenseStatus,
      clearancePurpose: req.clearancePurpose,
      destinationCountry: req.destination,
      requirements: requirementFields.map((f) => t(f.labelKey)),
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
    const storageKey = `${BOOKING_DRAFT_PREFIX}${selectedService.slug}`;
    try {
      await bookingMutation.mutateAsync(payload);
      if (isGuest) {
        updateGuestProfile({ name: fullName, email, phone });
      }
      await AsyncStorage.removeItem(storageKey);
      setSubmitted(true);
    } catch (error) {
      Alert.alert(t('book.bookingFailed'), error instanceof Error ? error.message : t('book.retryMessage'));
    }
  };

  const renderTrustRow = () => (
    <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
      {[t('book.trustClients'), t('book.trustSuccess'), t('book.trustSupport')].map((label) => (
        <View
          key={label}
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: `${colors.border}55` }}
        >
          <Text className="text-xs font-medium" style={{ color: colors.text }}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderHelpFooter = () => (
    <View className="items-center gap-2 pb-2">
      <Text className="text-sm" style={{ color: colors.mutedText }}>
        {t('book.needHelp')}
      </Text>
      <View className="flex-row flex-wrap justify-center" style={{ gap: spacing.stackMd }}>
        <Pressable onPress={() => void openWhatsApp()} accessibilityRole="link">
          <Text className="text-sm font-semibold underline" style={{ color: colors.primary }}>
            {t('book.chatWhatsApp')}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/contact')} accessibilityRole="link">
          <Text className="text-sm font-semibold underline" style={{ color: colors.primary }}>
            {t('book.contactTeam')}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStepContent = () => {
    if (submitted) {
      return (
        <Card className="py-6">
          <Text className="text-xl font-bold" style={{ color: colors.success }}>
            {t('book.bookingSubmitted')}
          </Text>
          <Text className="mt-2 leading-6" style={{ color: colors.text }}>
            {t('book.bookingSubmittedSubtitle')}
          </Text>
          <View className="mt-5 gap-3">
            {isGuest ? (
              <Button label={t('book.createAccount')} onPress={() => router.replace('/(auth)/signup')} />
            ) : null}
            <Button
              label={t('book.trackCase')}
              variant={isGuest ? 'secondary' : 'primary'}
              onPress={() => router.replace(isGuest ? '/(auth)/login' : '/(tabs)/dashboard')}
            />
          </View>
        </Card>
      );
    }

    if (step === 1) {
      return (
        <Section title={t('book.clientDetails')}>
          <Card>
            <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
              {t('book.service')}
            </Text>
            <Text className="mt-1 text-lg font-bold" style={{ color: colors.text }}>
              {selectedService.title}
            </Text>
            <Text className="mt-2 text-base font-semibold" style={{ color: colors.primary }}>
              {startingPriceLine}
            </Text>
            <Text className="mt-1 text-xs" style={{ color: colors.mutedText }}>
              {t('book.quoteNote')}
            </Text>
            {renderTrustRow()}
            <View className="mt-4">
              <Button label={t('book.changeService')} variant="secondary" onPress={() => router.push('/(tabs)/services')} />
            </View>
          </Card>
          <Input
            label={t('auth.fullName')}
            placeholder={t('auth.fullName')}
            value={fullName}
            onChangeText={(v) => {
              setFullName(v);
              setErrors((e) => ({ ...e, fullName: '' }));
            }}
            error={errors.fullName}
          />
          <Input
            label={t('auth.email')}
            placeholder={t('auth.email')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setErrors((e) => ({ ...e, email: '' }));
            }}
            error={errors.email}
          />
          <Input
            label={t('auth.phone')}
            placeholder={t('auth.phone')}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setErrors((e) => ({ ...e, phone: '' }));
            }}
            error={errors.phone}
          />
        </Section>
      );
    }

    if (step === 2) {
      return (
        <Section title={t('book.serviceRequirements')}>
          <Card>
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>
              {startingPriceLine}
            </Text>
            <Text className="mt-1 text-xs" style={{ color: colors.mutedText }}>
              {t('book.quoteNote')}
            </Text>
          </Card>
          {requirementFields.map((field) => (
            <SelectField
              key={field.id}
              label={t(field.labelKey)}
              placeholder={t(field.labelKey)}
              value={req[field.id] ?? ''}
              onChange={(v) => setReqField(field.id, v)}
              options={toSelectOptions(field.optionKeys, t)}
              error={errors[field.id]}
            />
          ))}
          <Input
            placeholder={t('book.optionalNote')}
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
            className="min-h-[88px]"
          />

          <Card>
            <Text className="font-semibold" style={{ color: colors.text }}>
              {t('book.documents')}
            </Text>
            <Text className="mt-1 text-sm leading-5" style={{ color: colors.mutedText }}>
              {t('book.uploadLaterHint')}
            </Text>
            <Text className="mt-2 text-xs" style={{ color: colors.mutedText }}>
              {t('book.uploadFromFilesOrCamera')}
            </Text>
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
                  <Text key={doc.id} className="text-sm" style={{ color: colors.mutedText }}>
                    • {doc.name}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        </Section>
      );
    }

    return (
      <Section title={t('book.reviewConfirm')}>
        <Card>
          <Text className="text-sm" style={{ color: colors.mutedText }}>
            {t('book.service')}
          </Text>
          <Text className="font-semibold" style={{ color: colors.text }}>
            {selectedService.title}
          </Text>
          <Text className="mt-2 text-base font-semibold" style={{ color: colors.primary }}>
            {startingPriceLine}
          </Text>

          <Text className="mt-4 text-sm" style={{ color: colors.mutedText }}>
            {t('book.client')}
          </Text>
          <Text style={{ color: colors.text }}>{fullName}</Text>
          <Text style={{ color: colors.text }}>{email}</Text>
          <Text style={{ color: colors.text }}>{phone}</Text>

          <Text className="mt-4 text-sm" style={{ color: colors.mutedText }}>
            {t('book.requirements')}
          </Text>
          {requirementFields.map((field) => (
            <Text key={field.id} style={{ color: colors.text }}>
              {t(field.labelKey)}: {req[field.id] ?? '—'}
            </Text>
          ))}
          {notes.trim() ? (
            <Text className="mt-2" style={{ color: colors.text }}>
              {t('book.notes')}: {notes}
            </Text>
          ) : null}
          <Text className="mt-3 text-sm" style={{ color: colors.mutedText }}>
            {t('book.documentsCount', { count: uploadedDocuments.length })}
          </Text>
        </Card>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button label={t('book.editContact')} variant="secondary" onPress={() => setStep(1)} />
          </View>
          <View className="flex-1">
            <Button label={t('book.editRequirements')} variant="secondary" onPress={() => setStep(2)} />
          </View>
        </View>
      </Section>
    );
  };

  const primaryLabel =
    step === 1 ? t('book.continue') : step === 2 ? t('book.reviewBooking') : t('book.confirmSubmit');

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 28 }}>
        {!submitted ? (
          <>
            <PageHeader
              title={t('book.title')}
              subtitle={`${t('book.stepProgress', { step, total: 3 })} · ${stepTitle}`}
            />
            <Card className="py-3">
              <View className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: colors.border }}>
                <View className="h-2 rounded-full" style={{ width: progressPercent, backgroundColor: colors.primary }} />
              </View>
            </Card>
          </>
        ) : (
          <PageHeader title={t('book.title')} subtitle={t('book.confirmation')} />
        )}

        {draftReady ? (
          <Animated.View
            style={{
              opacity: transition,
              transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            }}
          >
            {renderStepContent()}
          </Animated.View>
        ) : (
          <Text className="px-1 text-sm" style={{ color: colors.mutedText }}>
            {t('common.loading')}
          </Text>
        )}

        {draftReady && !submitted ? (
          <>
            <View className="mt-2 flex-row gap-2">
              <View className="flex-1">
                <Button label={t('common.back')} variant="secondary" onPress={goBack} disabled={step === 1} />
              </View>
              <View className="flex-1">
                {step < 3 ? (
                  <Button label={primaryLabel} onPress={goNext} />
                ) : (
                  <Button
                    label={bookingMutation.isPending ? t('book.submitting') : t('book.confirmSubmit')}
                    onPress={() => void submitBooking()}
                    disabled={bookingMutation.isPending}
                  />
                )}
              </View>
            </View>
            {renderHelpFooter()}
          </>
        ) : null}

        {submitted ? renderHelpFooter() : null}
      </ScrollView>
    </SafeAreaView>
  );
}
