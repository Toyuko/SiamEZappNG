import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Section } from '../../components/ui/Section';
import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';

export default function ContactScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceRequired, setServiceRequired] = useState('');
  const [message, setMessage] = useState('');
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serviceOptionKeys = [
    'marriageRegistration',
    'translationServices',
    'driversLicense',
    'policeClearance',
    'visaServices',
    'constructionHandyman',
    'vehicleRegistration',
    'transportationServices',
    'privateDriverService',
    'eventPlanningVenueServices',
    'otherServices',
  ] as const;
  const serviceOptions = serviceOptionKeys.map((key) => t(`contact.serviceOptions.${key}`));

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      nextErrors.fullName = t('contact.fullNameRequired');
    }
    if (!email.trim()) {
      nextErrors.email = t('contact.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = t('contact.emailInvalid');
    }
    if (!serviceRequired.trim()) {
      nextErrors.serviceRequired = t('contact.serviceRequired');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitRequest = async () => {
    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 700));

      Alert.alert(t('contact.requestSubmitted'), t('contact.requestSubmittedMessage'));

      setFullName('');
      setEmail('');
      setPhone('');
      setServiceRequired('');
      setMessage('');
      setErrors({});
      setServicePickerOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 28 }}>
        <Header title={t('contact.title')} subtitle={t('contact.subtitle')} gradient />

        <Card>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>{t('contact.contactDetails')}</Text>
          <View className="mt-3 gap-2">
            <Text style={{ color: colors.text }}>Email: inquiries@siam-ez.com</Text>
            <Text style={{ color: colors.text }}>Phone: +66 64 343 8768</Text>
            <Text style={{ color: colors.text }}>LINE Official: @siamez</Text>
          </View>
        </Card>

        <Section title={t('contact.bookService')}>
          <Input placeholder={t('contact.fullName')} value={fullName} onChangeText={setFullName} error={errors.fullName} />
          <Input
            placeholder={t('contact.emailAddress')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <Input placeholder={t('contact.phoneNumber')} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          <View className="space-y-1.5">
            <Text className="text-sm font-medium" style={{ color: colors.text }}>{t('contact.serviceRequiredLabel')}</Text>
            <Pressable
              className="rounded-2xl border px-4 py-3.5"
              style={{
                backgroundColor: colors.card,
                borderColor: errors.serviceRequired ? colors.danger : colors.border,
              }}
              onPress={() => setServicePickerOpen((prev) => !prev)}
            >
              <Text className="text-base" style={{ color: serviceRequired ? colors.text : colors.mutedText }}>
                {serviceRequired || t('contact.selectService')}
              </Text>
            </Pressable>
            {errors.serviceRequired ? <Text className="text-sm" style={{ color: colors.danger }}>{errors.serviceRequired}</Text> : null}
          </View>

          {servicePickerOpen ? (
            <Card className="gap-2">
              {serviceOptions.map((item) => (
                <Pressable
                  key={item}
                  className="rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: serviceRequired === item ? colors.primary : colors.background }}
                  onPress={() => {
                    setServiceRequired(item);
                    setServicePickerOpen(false);
                    setErrors((prev) => ({ ...prev, serviceRequired: '' }));
                  }}
                >
                  <Text style={{ color: serviceRequired === item ? '#ffffff' : colors.text }}>{item}</Text>
                </Pressable>
              ))}
            </Card>
          ) : null}

          <Input
            placeholder={t('contact.message')}
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
            className="min-h-[120px]"
          />
          <Button label={isSubmitting ? t('contact.submitting') : t('contact.submitRequest')} onPress={() => void submitRequest()} disabled={isSubmitting} />
        </Section>

        <Card>
          <Text className="text-sm" style={{ color: colors.mutedText }}>{t('contact.preferOnline')}</Text>
          <View className="mt-3">
            <Button label={t('contact.goPortal')} variant="secondary" onPress={() => router.push('/(tabs)/book')} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
