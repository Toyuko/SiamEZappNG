import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { Section } from '../../components/ui/Section';
import { serviceCatalog } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const service = serviceCatalog.find((item) => item.slug === slug);

  if (!service) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6" style={{ backgroundColor: colors.background }}>
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>{t('serviceDetail.notFound')}</Text>
        <View className="mt-4 w-full">
          <Button label={t('serviceDetail.backToServices')} onPress={() => router.replace('/(tabs)/services')} />
        </View>
      </SafeAreaView>
    );
  }

  const openContact = async () => {
    const url = 'https://siam-e-zweb-ng.vercel.app/contact';
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
      return;
    }
    await Linking.openURL(url);
  };

  const openWebsiteService = async () => {
    const url = `https://siam-e-zweb-ng.vercel.app/en/services/${service.slug}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <Button label={t('serviceDetail.backToServicesLower')} variant="secondary" size="md" fullWidth={false} onPress={() => router.back()} />

        <Header title={service.title} subtitle={service.shortDescription} gradient rightSlot={<Text className="text-3xl">{service.icon}</Text>} />

        <Section title={t('serviceDetail.overview')}>
          <Card>
            <Text style={{ color: colors.mutedText }}>{service.fullDescription}</Text>
          </Card>

          {service.overviewHighlights?.map((highlight) => (
            <Card key={highlight.title}>
              <Text className="text-base font-semibold" style={{ color: colors.text }}>{highlight.title}</Text>
              <Text className="mt-2" style={{ color: colors.mutedText }}>{highlight.description}</Text>
            </Card>
          ))}
        </Section>

        <Section title={t('serviceDetail.processSteps')}>
          <Card>
            {service.steps.map((item, idx) => (
              <Text key={item} className="mt-2" style={{ color: colors.mutedText }}>
                {idx + 1}. {item}
              </Text>
            ))}
          </Card>
        </Section>

        {service.requirements?.length ? (
          <Section title={t('serviceDetail.requirements')}>
            <Card>
              {service.requirements.map((item) => (
                <Text key={item} className="mt-2" style={{ color: colors.mutedText }}>
                  - {item}
                </Text>
              ))}
            </Card>
          </Section>
        ) : null}

        {service.requiredDocuments?.length ? (
          <Section title={t('serviceDetail.requiredDocuments')}>
            <Card>
              {service.requiredDocuments.map((item) => (
                <Text key={item} className="mt-2" style={{ color: colors.mutedText }}>
                  - {item}
                </Text>
              ))}
            </Card>
          </Section>
        ) : null}

        {service.pricingPackages?.length ? (
          <Section title={t('serviceDetail.packagesPricing')}>
            {service.pricingPackages.map((pkg) => (
              <Card key={pkg.name}>
                {pkg.isPopular ? (
                  <View className="mb-3">
                    <Badge label={t('serviceDetail.mostPopular')} />
                  </View>
                ) : null}
                <Text className="text-lg font-semibold" style={{ color: colors.text }}>{pkg.name}</Text>
                <Text className="mt-1" style={{ color: colors.primary }}>{pkg.price}</Text>
                <View className="mt-2">
                  {pkg.features.map((feature) => (
                    <Text key={feature} className="mt-2" style={{ color: colors.mutedText }}>
                      - {feature}
                    </Text>
                  ))}
                </View>
                <Pressable
                  className="mt-4 self-start rounded-full border px-4 py-2"
                  style={{ borderColor: colors.border }}
                  onPress={() => router.push({ pathname: '/(tabs)/book', params: { service: service.title, serviceSlug: service.slug } })}
                >
                  <Text className="font-semibold" style={{ color: colors.primary }}>{pkg.ctaLabel}</Text>
                </Pressable>
              </Card>
            ))}
          </Section>
        ) : null}

        {service.faqs?.length ? (
          <Section title={t('serviceDetail.faq')}>
            {service.faqs.map((faq) => (
              <Card key={faq.question}>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>{faq.question}</Text>
                <Text className="mt-2" style={{ color: colors.mutedText }}>{faq.answer}</Text>
              </Card>
            ))}
          </Section>
        ) : null}

        {service.processingTime || service.rating || service.consultationNote ? (
          <Section title={t('serviceDetail.serviceDetails')}>
            <Card>
              {service.processingTime ? (
                <Text style={{ color: colors.mutedText }}>
                  <Text className="font-semibold" style={{ color: colors.text }}>{t('serviceDetail.processingTime')} </Text>
                  {service.processingTime}
                </Text>
              ) : null}
              {service.rating ? (
                <Text className="mt-3" style={{ color: colors.mutedText }}>
                  <Text className="font-semibold" style={{ color: colors.text }}>{t('serviceDetail.customerRating')} </Text>
                  {service.rating}
                </Text>
              ) : null}
              {service.consultationNote ? (
                <Text className="mt-3" style={{ color: colors.mutedText }}>
                  <Text className="font-semibold" style={{ color: colors.text }}>{t('serviceDetail.consultation')} </Text>
                  {service.consultationNote}
                </Text>
              ) : null}
            </Card>
          </Section>
        ) : null}

        {service.disclaimer ? (
          <Card>
            <Text className="text-xs" style={{ color: colors.mutedText }}>{service.disclaimer}</Text>
          </Card>
        ) : null}

        <Button label={t('serviceDetail.bookThisService')} onPress={() => router.push({ pathname: '/(tabs)/book', params: { service: service.title, serviceSlug: service.slug } })} />
        <Button label={t('serviceDetail.contactUs')} variant="secondary" onPress={() => void openContact()} />
        <Button label={t('serviceDetail.viewWebsite')} variant="secondary" onPress={() => void openWebsiteService()} />
      </ScrollView>
    </SafeAreaView>
  );
}

