import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const SOCIAL_LINKS = [
  { url: 'https://www.facebook.com/siamezofficial', icon: 'logo-facebook' as const, labelKey: 'contact.social.facebook' },
  { url: 'https://www.instagram.com/siam_ez/', icon: 'logo-instagram' as const, labelKey: 'contact.social.instagram' },
  { url: 'https://www.linkedin.com/company/siam-ez/', icon: 'logo-linkedin' as const, labelKey: 'contact.social.linkedin' },
  { url: 'https://www.youtube.com/@siamezofficial/', icon: 'logo-youtube' as const, labelKey: 'contact.social.youtube' },
  { url: 'https://www.tiktok.com/@siam_ez', icon: 'logo-tiktok' as const, labelKey: 'contact.social.tiktok' },
];

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

  const openSocialUrl = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
      return;
    }
    await Linking.openURL(url);
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
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 + VOICE_FAB_SCROLL_EXTRA }}>
        <PageHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />

        <Card>
          <Text className="text-base font-bold" style={{ color: colors.foreground }}>
            {t('contact.contactDetails')}
          </Text>
          <View className="mt-3 gap-2">
            <Text className="text-sm leading-5" style={{ color: colors.foreground }}>
              Email: inquiries@siam-ez.com
            </Text>
            <Text className="text-sm leading-5" style={{ color: colors.foreground }}>
              Phone: +66 64 343 8768
            </Text>
            <Text className="text-sm leading-5" style={{ color: colors.foreground }}>
              LINE Official: @siamez
            </Text>
          </View>

          <View className="mt-5 border-t pt-4" style={{ borderTopColor: colors.border }}>
            <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
              {t('contact.followUs')}
            </Text>
            <View className="mt-3 flex-row flex-wrap" style={{ gap: 10 }}>
              {SOCIAL_LINKS.map((item) => (
                <Pressable
                  key={item.url}
                  accessibilityRole="link"
                  accessibilityLabel={t(item.labelKey)}
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => void openSocialUrl(item.url)}
                >
                  <Ionicons name={item.icon} size={22} color="#ffffff" />
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        <Section title={t('contact.bookService')}>
          <Card>
            <Input placeholder={t('contact.fullName')} value={fullName} onChangeText={setFullName} error={errors.fullName} />
            <Input
              placeholder={t('contact.emailAddress')}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              className="mt-3"
            />
            <Input placeholder={t('contact.phoneNumber')} keyboardType="phone-pad" value={phone} onChangeText={setPhone} className="mt-3" />

            <View className="mt-3 space-y-1.5">
              <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                {t('contact.serviceRequiredLabel')}
              </Text>
              <Pressable
                className="border px-4 py-3.5"
                style={{
                  backgroundColor: colors.card,
                  borderColor: errors.serviceRequired ? colors.danger : colors.border,
                  borderRadius: radius.button,
                  borderWidth: 1,
                }}
                onPress={() => setServicePickerOpen((prev) => !prev)}
              >
                <Text className="text-base" style={{ color: serviceRequired ? colors.foreground : colors.muted }}>
                  {serviceRequired || t('contact.selectService')}
                </Text>
              </Pressable>
              {errors.serviceRequired ? (
                <Text className="text-sm" style={{ color: colors.danger }}>
                  {errors.serviceRequired}
                </Text>
              ) : null}
            </View>

            {servicePickerOpen ? (
              <Card className="mt-3 gap-2">
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
                    <Text style={{ color: serviceRequired === item ? '#ffffff' : colors.foreground }}>{item}</Text>
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
              className="mt-3 min-h-[120px]"
            />
            <View className="mt-4">
              <Button label={isSubmitting ? t('contact.submitting') : t('contact.submitRequest')} onPress={() => void submitRequest()} disabled={isSubmitting} />
            </View>
          </Card>
        </Section>

        <Card>
          <Text className="text-sm leading-5" style={{ color: colors.muted }}>
            {t('contact.preferOnline')}
          </Text>
          <View className="mt-3">
            <Button label={t('cta.bookNow')} variant="secondary" onPress={() => router.push('/(tabs)/book')} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
