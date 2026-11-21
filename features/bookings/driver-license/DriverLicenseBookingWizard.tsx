import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingProgress } from '../../../components/booking/BookingProgress';
import { SelectionCard } from '../../../components/booking/SelectionCard';
import { SegmentedControl } from '../../../components/booking/SegmentedControl';
import { StickyBookingBar } from '../../../components/booking/StickyBookingBar';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCreateBooking } from '../../../hooks/use-create-booking';
import { useUploadDocument } from '../../../hooks/use-upload-document';
import { t } from '../../../lib/i18n/i18n';
import { siam, spacing } from '../../../lib/theme/tokens';
import { useTheme } from '../../../lib/theme/theme';
import { useAuthStore } from '../../../store/auth-store';
import {
  buildDriverLicenseFormData,
  computeDriverLicenseQuote,
  createEmptyDriverLicenseAnswers,
  formatThb,
  getUpcomingWeekdayOptions,
  isValidDriverLicenseAppointmentDate,
  type DepositPaymentMethod,
  type DriverLicenseAnswers,
  type LicenseServiceCategory,
  type LicenseVehicleType,
  type PaymentChoice,
  type ResidentialCertificatePlan,
} from './pricing';

const DRAFT_KEY = '@booking-draft:v2:driver-license';
const WHATSAPP_URL = 'https://wa.me/66643438768';
const STAGES = [
  { id: 'service', label: 'Service' },
  { id: 'quote', label: 'Quote' },
  { id: 'details', label: 'Details' },
  { id: 'confirm', label: 'Confirm' },
] as const;

type StageId = (typeof STAGES)[number]['id'];
type UploadedDoc = { id: string; name: string };

type Props = {
  serviceTitle: string;
};

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>
      {children}
      {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
    </Text>
  );
}

function Hint({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text style={{ color: colors.mutedText, fontSize: 12, lineHeight: 17, marginTop: 6 }}>
      {children}
    </Text>
  );
}

export function DriverLicenseBookingWizard({ serviceTitle }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const { isGuest, guestProfile, user, updateGuestProfile, accessToken } = useAuthStore();
  const bookingMutation = useCreateBooking();
  const uploadMutation = useUploadDocument();

  const [stage, setStage] = useState<StageId>('service');
  const [answers, setAnswers] = useState<DriverLicenseAnswers>(() =>
    createEmptyDriverLicenseAnswers()
  );
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [quoteAccepted, setQuoteAccepted] = useState(false);
  const transition = useRef(new Animated.Value(1)).current;

  const stageIndex = STAGES.findIndex((s) => s.id === stage);
  const quote = useMemo(() => computeDriverLicenseQuote(answers), [answers]);
  const weekdayOptions = useMemo(() => getUpcomingWeekdayOptions(10), []);
  const dueNow = quote
    ? answers.paymentChoice === 'full'
      ? quote.totalThb
      : quote.depositThb
    : 0;

  const patch = useCallback((partial: Partial<DriverLicenseAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...partial }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(partial)) delete next[key];
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const raw = await AsyncStorage.getItem(DRAFT_KEY);
      if (cancelled) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as {
            stage?: StageId;
            answers?: DriverLicenseAnswers;
            quoteAccepted?: boolean;
          };
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.stage && STAGES.some((s) => s.id === parsed.stage)) {
            setStage(parsed.stage);
          }
          setQuoteAccepted(Boolean(parsed.quoteAccepted));
        } catch {
          setAnswers(
            createEmptyDriverLicenseAnswers({
              name: isGuest ? guestProfile?.name ?? '' : user?.name ?? '',
              email: isGuest ? guestProfile?.email ?? '' : user?.email ?? '',
              phone: isGuest ? guestProfile?.phone ?? '' : '',
            })
          );
        }
      } else {
        setAnswers(
          createEmptyDriverLicenseAnswers({
            name: isGuest ? guestProfile?.name ?? '' : user?.name ?? '',
            email: isGuest ? guestProfile?.email ?? '' : user?.email ?? '',
            phone: isGuest ? guestProfile?.phone ?? '' : '',
          })
        );
      }
      setDraftReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!draftReady || submitted) return;
    void AsyncStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ stage, answers, quoteAccepted, savedAt: new Date().toISOString() })
    );
  }, [draftReady, submitted, stage, answers, quoteAccepted]);

  useEffect(() => {
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [stage, transition]);

  const validateService = () => {
    const next: Record<string, string> = {};
    if (!answers.category) next.category = t('book.requiredSelection');
    if (answers.category && answers.category !== 'idp') {
      if (!answers.hasForeignLicense) next.hasForeignLicense = t('book.requiredSelection');
      if (!answers.residentialCertificate) next.residentialCertificate = t('book.requiredSelection');
      if (!answers.vehicleType) next.vehicleType = t('book.requiredSelection');
    }
    if (!answers.fitToDrive) next.fitToDrive = t('book.requiredSelection');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateDetails = () => {
    const next: Record<string, string> = {};
    if (!answers.appointmentDate || !isValidDriverLicenseAppointmentDate(answers.appointmentDate)) {
      next.appointmentDate = t('book.dl.appointmentInvalid');
    }
    if (!answers.name.trim()) next.name = t('book.requiredFullName');
    if (!answers.email.trim()) next.email = t('book.requiredEmail');
    if (!answers.phone.trim()) next.phone = t('book.requiredPhone');
    if (answers.depositPaymentMethod === 'online' && docs.length < 1) {
      next.receipt = t('book.dl.receiptRequired');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = async () => {
    void Haptics.selectionAsync();
    if (stage === 'service') {
      if (!validateService()) return;
      setQuoteAccepted(false);
      setStage('quote');
      return;
    }
    if (stage === 'quote') {
      if (!quoteAccepted || !quote) {
        setErrors({ quote: t('book.dl.acceptQuoteFirst') });
        return;
      }
      setStage('details');
      return;
    }
    if (stage === 'details') {
      if (!validateDetails()) return;
      setStage('confirm');
    }
  };

  const goBack = () => {
    void Haptics.selectionAsync();
    setErrors({});
    if (stage === 'quote') setStage('service');
    else if (stage === 'details') setStage('quote');
    else if (stage === 'confirm') setStage('details');
  };

  const acceptQuote = (choice: PaymentChoice) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    patch({ paymentChoice: choice });
    setQuoteAccepted(true);
    setErrors({});
    setStage('details');
  };

  const uploadFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.uri) return;
    try {
      const uploaded = await uploadMutation.mutateAsync({
        uri: asset.uri,
        name: asset.name ?? 'payment-receipt',
        mimeType: asset.mimeType ?? undefined,
      });
      setDocs((prev) => [...prev, { id: uploaded.id, name: uploaded.name }]);
      setErrors((e) => {
        const next = { ...e };
        delete next.receipt;
        return next;
      });
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
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.uri) return;
    try {
      const uploaded = await uploadMutation.mutateAsync({
        uri: asset.uri,
        name: 'payment-receipt.jpg',
        mimeType: 'image/jpeg',
      });
      setDocs((prev) => [...prev, { id: uploaded.id, name: uploaded.name }]);
      setErrors((e) => {
        const next = { ...e };
        delete next.receipt;
        return next;
      });
    } catch (error) {
      Alert.alert(t('book.uploadFailed'), error instanceof Error ? error.message : t('book.retryMessage'));
    }
  };

  const submitBooking = async () => {
    if (!quote) return;
    if (!validateDetails()) {
      setStage('details');
      return;
    }
    const formData = buildDriverLicenseFormData(answers, quote);
    const payload = {
      serviceId: 'driver-license',
      serviceSlug: 'driver-license',
      userId: accessToken && user?.id ? user.id : undefined,
      guestName: answers.name.trim(),
      guestEmail: answers.email.trim(),
      guestPhone: answers.phone.trim(),
      formData,
      documentIds: docs.map((d) => d.id),
      // Backward-compatible fields for older API consumers
      details: formData,
      documents: docs.map((d) => d.id),
    };
    try {
      await bookingMutation.mutateAsync(payload);
      if (isGuest) {
        updateGuestProfile({
          name: answers.name.trim(),
          email: answers.email.trim(),
          phone: answers.phone.trim(),
        });
      }
      await AsyncStorage.removeItem(DRAFT_KEY);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch (error) {
      Alert.alert(t('book.bookingFailed'), error instanceof Error ? error.message : t('book.retryMessage'));
    }
  };

  const startOver = () => {
    void AsyncStorage.removeItem(DRAFT_KEY);
    setAnswers(
      createEmptyDriverLicenseAnswers({
        name: isGuest ? guestProfile?.name ?? '' : user?.name ?? '',
        email: isGuest ? guestProfile?.email ?? '' : user?.email ?? '',
        phone: isGuest ? guestProfile?.phone ?? '' : '',
      })
    );
    setDocs([]);
    setQuoteAccepted(false);
    setStage('service');
    setErrors({});
  };

  const primaryLabel = (() => {
    if (bookingMutation.isPending) return t('book.submitting');
    if (stage === 'service') return t('book.continue');
    if (stage === 'quote') {
      return quoteAccepted ? t('book.dl.continueToBooking') : t('book.dl.acceptQuoteAbove');
    }
    if (stage === 'details') return t('book.dl.continueToConfirm');
    return t('book.confirmSubmit');
  })();

  const hidePrimary = stage === 'quote' && !quoteAccepted;

  const renderService = () => (
    <View style={{ gap: 18 }}>
      <View>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
          {t('book.dl.serviceTitle')}
        </Text>
        <Text style={{ color: colors.mutedText, marginTop: 6, fontSize: 14, lineHeight: 20 }}>
          {t('book.dl.serviceSubtitle')}
        </Text>
      </View>

      <View>
        <FieldLabel required>{t('book.dl.whatDoYouNeed')}</FieldLabel>
        <View style={{ gap: 10 }}>
          {(
            [
              ['apply_new', t('book.dl.catNew'), t('book.dl.catNewDesc')],
              ['conversion', t('book.dl.catConversion'), t('book.dl.catConversionDesc')],
              ['renewal', t('book.dl.catRenewal'), t('book.dl.catRenewalDesc')],
              ['idp', t('book.dl.catIdp'), t('book.dl.catIdpDesc')],
            ] as const
          ).map(([value, label, description]) => (
            <SelectionCard
              key={value}
              label={label}
              description={description}
              selected={answers.category === value}
              onPress={() => patch({ category: value as LicenseServiceCategory })}
            />
          ))}
        </View>
        {errors.category ? <Hint>{errors.category}</Hint> : null}
      </View>

      {answers.category && answers.category !== 'idp' ? (
        <>
          <View>
            <FieldLabel required>{t('book.dl.hasForeignLicense')}</FieldLabel>
            <SegmentedControl
              value={answers.hasForeignLicense}
              onChange={(v) => patch({ hasForeignLicense: v as 'yes' | 'no' })}
              options={[
                { value: 'yes', label: t('book.dl.yes') },
                { value: 'no', label: t('book.dl.no') },
              ]}
            />
            {errors.hasForeignLicense ? <Hint>{errors.hasForeignLicense}</Hint> : null}
          </View>

          <View>
            <FieldLabel required>{t('book.dl.residential')}</FieldLabel>
            <Hint>{t('book.dl.residentialHint')}</Hint>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <SelectionCard
                fill
                label={t('book.dl.residentialSelf')}
                description={t('book.dl.residentialSelfDesc')}
                selected={answers.residentialCertificate === 'self'}
                onPress={() => patch({ residentialCertificate: 'self' as ResidentialCertificatePlan })}
              />
              <SelectionCard
                fill
                label={t('book.dl.residentialHelp')}
                description={t('book.dl.residentialHelpDesc')}
                selected={answers.residentialCertificate === 'need_help'}
                onPress={() =>
                  patch({ residentialCertificate: 'need_help' as ResidentialCertificatePlan })
                }
              />
            </View>
            {errors.residentialCertificate ? <Hint>{errors.residentialCertificate}</Hint> : null}
          </View>

          <View>
            <FieldLabel required>{t('book.dl.vehicle')}</FieldLabel>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(
                [
                  ['car', t('book.dl.vehicleCar'), t('book.dl.vehicleCarDesc')],
                  ['bike', t('book.dl.vehicleBike'), t('book.dl.vehicleBikeDesc')],
                  ['both', t('book.dl.vehicleBoth'), t('book.dl.vehicleBothDesc')],
                ] as const
              ).map(([value, label, description]) => (
                <SelectionCard
                  key={value}
                  fill
                  compact
                  label={label}
                  description={description}
                  selected={answers.vehicleType === value}
                  onPress={() => patch({ vehicleType: value as LicenseVehicleType })}
                />
              ))}
            </View>
            {errors.vehicleType ? <Hint>{errors.vehicleType}</Hint> : null}
          </View>
        </>
      ) : null}

      <View>
        <FieldLabel required>{t('book.dl.fitToDrive')}</FieldLabel>
        <SegmentedControl
          value={answers.fitToDrive}
          onChange={(v) => patch({ fitToDrive: v as 'yes' | 'no' })}
          options={[
            { value: 'yes', label: t('book.dl.yes') },
            { value: 'no', label: t('book.dl.notSure') },
          ]}
        />
        <Hint>{t('book.dl.fitHint')}</Hint>
        {errors.fitToDrive ? <Hint>{errors.fitToDrive}</Hint> : null}
      </View>

      <Input
        label={t('book.dl.nationalityOptional')}
        placeholder="e.g. Canadian"
        value={answers.nationality}
        onChangeText={(v) => patch({ nationality: v })}
      />

      <Pressable
        onPress={() => patch({ addonTranslationLetter: !answers.addonTranslationLetter })}
        style={{
          borderWidth: 1,
          borderColor: answers.addonTranslationLetter ? siam.blue.DEFAULT : colors.border,
          backgroundColor: answers.addonTranslationLetter ? `${siam.blue.DEFAULT}12` : colors.card,
          borderRadius: 16,
          padding: 14,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }}>{t('book.dl.translationAddon')}</Text>
        <Text style={{ color: colors.mutedText, fontSize: 12, marginTop: 4 }}>
          {t('book.dl.translationAddonDesc')}
        </Text>
      </Pressable>
    </View>
  );

  const renderQuote = () => {
    if (!quote) {
      return (
        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
            {t('book.dl.quoteTitle')}
          </Text>
          <Text style={{ color: colors.mutedText }}>{t('book.dl.quoteMissing')}</Text>
          <Button label={t('book.dl.editAnswers')} variant="secondary" onPress={() => setStage('service')} />
        </View>
      );
    }

    return (
      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
            {t('book.dl.quoteTitle')}
          </Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>{t('book.dl.quoteSubtitle')}</Text>
          <Text style={{ color: colors.text, marginTop: 4, fontWeight: '600' }}>{serviceTitle}</Text>
        </View>

        <View
          style={{
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            overflow: 'hidden',
          }}
        >
          {quote.lineItems.map((item) => (
            <View
              key={item.id}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <Text style={{ color: colors.text, flex: 1, fontWeight: '600' }}>{item.label}</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{formatThb(item.amountThb)}</Text>
            </View>
          ))}
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 14,
              backgroundColor: `${siam.blue.DEFAULT}10`,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '800' }}>{t('book.dl.total')}</Text>
            <Text style={{ color: siam.blue.DEFAULT, fontSize: 20, fontWeight: '800' }}>
              {formatThb(quote.totalThb)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12 }}>
            <Text style={{ color: colors.mutedText, fontSize: 11, fontWeight: '700' }}>
              {t('book.dl.total')}
            </Text>
            <Text style={{ color: colors.text, fontWeight: '800', marginTop: 4 }}>
              {formatThb(quote.totalThb)}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: `${siam.yellow.DEFAULT}88`,
              backgroundColor: `${siam.yellow.DEFAULT}22`,
              padding: 12,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>
              {t('book.dl.dueNow')}
            </Text>
            <Text style={{ color: colors.text, fontWeight: '800', marginTop: 4 }}>
              {formatThb(quote.depositThb)}
            </Text>
          </View>
          <View style={{ flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12 }}>
            <Text style={{ color: colors.mutedText, fontSize: 11, fontWeight: '700' }}>
              {t('book.dl.remaining')}
            </Text>
            <Text style={{ color: colors.text, fontWeight: '800', marginTop: 4 }}>
              {formatThb(quote.remainingThb)}
            </Text>
          </View>
        </View>

        <View
          style={{
            borderRadius: 14,
            backgroundColor: `${siam.blue.DEFAULT}10`,
            padding: 12,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('book.dl.whyDeposit')}</Text>
          <Text style={{ color: colors.mutedText, marginTop: 4, fontSize: 13, lineHeight: 18 }}>
            {t('book.dl.whyDepositBody')}
          </Text>
        </View>

        {quoteAccepted ? (
          <View
            style={{
              borderRadius: 14,
              backgroundColor: `${colors.success}18`,
              padding: 12,
            }}
          >
            <Text style={{ color: colors.success, fontWeight: '700' }}>{t('book.dl.quoteAccepted')}</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Button
              label={t('book.dl.secureBooking', { amount: formatThb(quote.depositThb) })}
              variant="accent"
              gradient
              onPress={() => acceptQuote('initial')}
            />
            <Button
              label={t('book.dl.payFull', { amount: formatThb(quote.totalThb) })}
              variant="secondary"
              onPress={() => acceptQuote('full')}
            />
            <Button label={t('book.dl.editAnswers')} variant="secondary" onPress={() => setStage('service')} />
          </View>
        )}
        {errors.quote ? <Hint>{errors.quote}</Hint> : null}
      </View>
    );
  };

  const renderDetails = () => (
    <View style={{ gap: 18 }}>
      <View>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
          {t('book.dl.detailsTitle')}
        </Text>
        <Text style={{ color: colors.mutedText, marginTop: 6, fontSize: 14, lineHeight: 20 }}>
          {t('book.dl.detailsSubtitle')}
        </Text>
      </View>

      <View>
        <FieldLabel required>{t('book.dl.appointmentDate')}</FieldLabel>
        <Hint>{t('book.dl.appointmentHint')}</Hint>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {weekdayOptions.map((opt) => {
            const selected = answers.appointmentDate === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => patch({ appointmentDate: opt.value })}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selected ? siam.blue.DEFAULT : colors.border,
                  backgroundColor: selected ? siam.blue.DEFAULT : colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: selected ? '#fff' : colors.text, fontWeight: '700', fontSize: 12 }}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {errors.appointmentDate ? <Hint>{errors.appointmentDate}</Hint> : null}
      </View>

      <View>
        <FieldLabel required>{t('book.dl.depositMethod')}</FieldLabel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SelectionCard
            fill
            label={t('book.dl.payOnline')}
            description={t('book.dl.payOnlineDesc')}
            selected={answers.depositPaymentMethod === 'online'}
            onPress={() => patch({ depositPaymentMethod: 'online' as DepositPaymentMethod })}
          />
          <SelectionCard
            fill
            label={t('book.dl.payOffice')}
            description={t('book.dl.payOfficeDesc')}
            selected={answers.depositPaymentMethod === 'office_cash'}
            onPress={() => patch({ depositPaymentMethod: 'office_cash' as DepositPaymentMethod })}
          />
        </View>
      </View>

      {answers.depositPaymentMethod === 'online' ? (
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '800' }}>{t('book.dl.receiptTitle')}</Text>
          <Text style={{ color: colors.mutedText, fontSize: 13, lineHeight: 18 }}>
            {t('book.dl.receiptBody', { amount: formatThb(dueNow) })}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={t('book.uploadFile')}
                onPress={() => void uploadFile()}
                disabled={uploadMutation.isPending}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label={t('book.camera')}
                variant="secondary"
                onPress={() => void takePhoto()}
                disabled={uploadMutation.isPending}
              />
            </View>
          </View>
          {docs.map((doc) => (
            <Text key={doc.id} style={{ color: colors.mutedText, fontSize: 13 }}>
              • {doc.name}
            </Text>
          ))}
          {errors.receipt ? <Hint>{errors.receipt}</Hint> : null}
        </View>
      ) : null}

      <Input
        label={t('auth.fullName')}
        value={answers.name}
        onChangeText={(v) => patch({ name: v })}
        error={errors.name}
        autoComplete="name"
      />
      <Input
        label={t('auth.email')}
        value={answers.email}
        onChangeText={(v) => patch({ email: v })}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Input
        label={t('book.dl.phoneWhatsApp')}
        value={answers.phone}
        onChangeText={(v) => patch({ phone: v })}
        error={errors.phone}
        keyboardType="phone-pad"
        placeholder="+66…"
      />
      <Input
        label={t('book.dl.notesOptional')}
        value={answers.notes}
        onChangeText={(v) => patch({ notes: v })}
        multiline
        textAlignVertical="top"
        className="min-h-[88px]"
      />
    </View>
  );

  const renderConfirm = () => (
    <View style={{ gap: 14 }}>
      <View>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
          {t('book.dl.confirmTitle')}
        </Text>
        <Text style={{ color: colors.mutedText, marginTop: 6 }}>{t('book.dl.confirmSubtitle')}</Text>
      </View>

      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.mutedText }}>{t('book.service')}</Text>
          <Pressable onPress={() => setStage('service')}>
            <Text style={{ color: siam.blue.DEFAULT, fontWeight: '700' }}>{t('book.editDetails')}</Text>
          </Pressable>
        </View>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{serviceTitle}</Text>
        {quote?.lineItems.map((item) => (
          <Text key={item.id} style={{ color: colors.text }}>
            {item.label}
          </Text>
        ))}
      </View>

      {quote ? (
        <View
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: `${siam.blue.DEFAULT}08`,
            padding: 14,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.mutedText }}>{t('book.dl.total')}</Text>
            <Text style={{ color: colors.text, fontWeight: '800' }}>{formatThb(quote.totalThb)}</Text>
          </View>
          <View
            style={{
              borderRadius: 12,
              backgroundColor: `${siam.yellow.DEFAULT}33`,
              paddingHorizontal: 12,
              paddingVertical: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('book.dl.dueNow')}</Text>
            <Text style={{ color: colors.text, fontWeight: '800' }}>{formatThb(dueNow)}</Text>
          </View>
          {answers.paymentChoice !== 'full' ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.mutedText }}>{t('book.dl.remainingAfter')}</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                {formatThb(quote.remainingThb)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.mutedText }}>{t('book.dl.detailsTitle')}</Text>
          <Pressable onPress={() => setStage('details')}>
            <Text style={{ color: siam.blue.DEFAULT, fontWeight: '700' }}>{t('book.editDetails')}</Text>
          </Pressable>
        </View>
        <Text style={{ color: colors.text }}>{answers.name}</Text>
        <Text style={{ color: colors.text }}>{answers.email}</Text>
        <Text style={{ color: colors.text }}>{answers.phone}</Text>
        <Text style={{ color: colors.text }}>
          {t('book.dl.appointmentDate')}: {answers.appointmentDate}
        </Text>
        <Text style={{ color: colors.text }}>
          {answers.depositPaymentMethod === 'online' ? t('book.dl.payOnline') : t('book.dl.payOffice')}
        </Text>
        {docs.length > 0 ? (
          <Text style={{ color: colors.mutedText }}>{t('book.documentsCount', { count: docs.length })}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        padding: 20,
        gap: 12,
      }}
    >
      <Text style={{ color: colors.success, fontSize: 22, fontWeight: '800' }}>
        {t('book.dl.successTitle')}
      </Text>
      <Text style={{ color: colors.mutedText, lineHeight: 20 }}>{t('book.dl.successBody')}</Text>
      {quote ? (
        <View style={{ borderRadius: 12, backgroundColor: `${siam.blue.DEFAULT}10`, padding: 12, gap: 4 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>
            {t('book.dl.dueNow')}: {formatThb(dueNow)}
          </Text>
          <Text style={{ color: colors.mutedText, fontSize: 13 }}>
            {answers.depositPaymentMethod === 'office_cash'
              ? t('book.dl.successOffice')
              : t('book.dl.successOnline')}
          </Text>
        </View>
      ) : null}
      <View style={{ gap: 10, marginTop: 8 }}>
        {isGuest ? (
          <Button label={t('book.createAccount')} onPress={() => router.replace('/(auth)/signup')} />
        ) : null}
        <Button
          label={t('book.trackCase')}
          variant={isGuest ? 'secondary' : 'primary'}
          onPress={() => router.replace(isGuest ? '/(auth)/login' : '/(tabs)/dashboard')}
        />
        <Button label={t('book.dl.backHome')} variant="secondary" onPress={() => router.replace('/(tabs)/home')} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF5FF' }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPaddingX,
          paddingTop: 12,
          paddingBottom: 24,
          gap: 14,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
              {t('book.dl.pageTitle')}
            </Text>
            <Text style={{ color: colors.mutedText, marginTop: 4, fontSize: 13 }}>
              {t('book.dl.pageSubtitle')}
            </Text>
          </View>
          <Pressable onPress={() => void Linking.openURL(WHATSAPP_URL)} hitSlop={8}>
            <Text style={{ color: siam.blue.DEFAULT, fontWeight: '700', fontSize: 13 }}>
              {t('book.needHelp')}
            </Text>
          </Pressable>
        </View>

        {!submitted ? (
          <>
            <BookingProgress stages={[...STAGES]} currentIndex={Math.max(stageIndex, 0)} />
            {draftReady ? (
              <Pressable onPress={startOver}>
                <Text style={{ color: siam.blue.DEFAULT, fontSize: 12, fontWeight: '600' }}>
                  {t('book.dl.startOver')}
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : null}

        {draftReady ? (
          <Animated.View
            style={{
              opacity: transition,
              transform: [
                {
                  translateY: transition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 16,
            }}
          >
            {submitted
              ? renderSuccess()
              : stage === 'service'
                ? renderService()
                : stage === 'quote'
                  ? renderQuote()
                  : stage === 'details'
                    ? renderDetails()
                    : renderConfirm()}
          </Animated.View>
        ) : (
          <Text style={{ color: colors.mutedText }}>{t('common.loading')}</Text>
        )}

        {!submitted ? (
          <Pressable onPress={() => router.push('/(tabs)/services')}>
            <Text style={{ color: siam.blue.DEFAULT, textAlign: 'center', fontWeight: '600' }}>
              {t('book.changeService')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {draftReady && !submitted && !hidePrimary ? (
        <StickyBookingBar
          primaryLabel={primaryLabel}
          onPrimary={() => {
            if (stage === 'confirm') void submitBooking();
            else void goNext();
          }}
          primaryDisabled={bookingMutation.isPending || uploadMutation.isPending}
          secondaryLabel={stage === 'service' ? undefined : t('common.back')}
          onSecondary={stage === 'service' ? undefined : goBack}
          secondaryDisabled={bookingMutation.isPending}
        />
      ) : null}
    </SafeAreaView>
  );
}
