import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';

import { FreelancerSkillChips } from '../../components/freelancer/FreelancerSkillChips';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import type { FreelancerServiceOffering } from '../../features/freelancer/freelancer-profile.types';
import {
  getFreelancerSlugError,
  normalizeFreelancerSlug,
} from '../../features/freelancer/freelancer-slug';
import {
  useMyFreelancerProfile,
  useUpdateMyFreelancerProfile,
} from '../../hooks/use-my-freelancer-profile';
import { appConfig } from '../../lib/config';
import { t } from '../../lib/i18n/i18n';
import { formatJobAmount } from '../../lib/jobs/format-amount';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type ServiceDraft = {
  key: string;
  title: string;
  description: string;
  /** Baht string for the form (API stores satang). */
  priceBaht: string;
};

function toServiceDrafts(services: FreelancerServiceOffering[]): ServiceDraft[] {
  return services.map((service, index) => ({
    key: `${service.title}-${index}`,
    title: service.title,
    description: service.description ?? '',
    priceBaht: service.price != null ? String(service.price / 100) : '',
  }));
}

function bahtToSatang(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const baht = Number(trimmed);
  if (!Number.isFinite(baht) || baht < 0) {
    return null;
  }
  return Math.round(baht * 100);
}

export function FreelancerSettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const profileQuery = useMyFreelancerProfile();
  const updateMutation = useUpdateMyFreelancerProfile();

  const [isPublic, setIsPublic] = useState(false);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRateBaht, setHourlyRateBaht] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState('');
  const [services, setServices] = useState<ServiceDraft[]>([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePriceBaht, setServicePriceBaht] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!profileQuery.data || hydrated) {
      return;
    }
    const profile = profileQuery.data.profile;
    if (profile) {
      setIsPublic(profile.isPublic);
      setSlug(profile.slug ?? '');
      setTitle(profile.title ?? '');
      setBio(profile.bio ?? '');
      setHourlyRateBaht(profile.hourlyRate != null ? String(profile.hourlyRate / 100) : '');
      setSkills(profile.skills ?? []);
      setServices(toServiceDrafts(profile.services ?? []));
    }
    setHydrated(true);
  }, [hydrated, profileQuery.data]);

  const slugError = useMemo(() => {
    if (!slug && !isPublic) {
      return null;
    }
    return getFreelancerSlugError(slug);
  }, [isPublic, slug]);

  const publicPreview = slug
    ? `${appConfig.webBaseUrl.replace(/^https?:\/\//, '')}/freelancers/${slug}`
    : `${appConfig.webBaseUrl.replace(/^https?:\/\//, '')}/freelancers/your-slug`;

  const handleSlugChange = (value: string) => {
    setSlug(normalizeFreelancerSlug(value));
  };

  const addSkill = () => {
    const next = skillDraft.trim();
    if (!next) {
      return;
    }
    if (skills.some((skill) => skill.toLowerCase() === next.toLowerCase())) {
      setSkillDraft('');
      return;
    }
    if (skills.length >= 30) {
      Alert.alert(t('freelancer.publicProfile.settings.skillLimitTitle'), t('freelancer.publicProfile.settings.skillLimitMessage'));
      return;
    }
    setSkills((prev) => [...prev, next.slice(0, 40)]);
    setSkillDraft('');
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const openServiceModal = () => {
    setServiceTitle('');
    setServiceDescription('');
    setServicePriceBaht('');
    setServiceModalOpen(true);
  };

  const addService = () => {
    const nextTitle = serviceTitle.trim();
    if (!nextTitle) {
      Alert.alert(t('freelancer.publicProfile.settings.serviceRequiredTitle'), t('freelancer.publicProfile.settings.serviceRequiredMessage'));
      return;
    }
    if (services.length >= 20) {
      Alert.alert(t('freelancer.publicProfile.settings.serviceLimitTitle'), t('freelancer.publicProfile.settings.serviceLimitMessage'));
      return;
    }
    setServices((prev) => [
      ...prev,
      {
        key: `${nextTitle}-${Date.now()}`,
        title: nextTitle.slice(0, 120),
        description: serviceDescription.trim().slice(0, 500),
        priceBaht: servicePriceBaht.trim(),
      },
    ]);
    setServiceModalOpen(false);
  };

  const removeService = (key: string) => {
    setServices((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSave = async () => {
    const error = getFreelancerSlugError(slug);
    if (error) {
      Alert.alert(t('freelancer.publicProfile.settings.slugInvalidTitle'), error);
      return;
    }
    if (isPublic && !slug) {
      Alert.alert(
        t('freelancer.publicProfile.settings.slugRequiredTitle'),
        t('freelancer.publicProfile.settings.slugRequiredMessage'),
      );
      return;
    }

    const hourlyRate = bahtToSatang(hourlyRateBaht);
    if (hourlyRateBaht.trim() && hourlyRate == null) {
      Alert.alert(t('freelancer.publicProfile.settings.rateInvalidTitle'), t('freelancer.publicProfile.settings.rateInvalidMessage'));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        slug,
        isPublic,
        title: title.trim(),
        bio: bio.trim(),
        skills,
        hourlyRate,
        services: services.map((service) => ({
          title: service.title,
          description: service.description || undefined,
          price: bahtToSatang(service.priceBaht),
          currency: 'THB',
        })),
      });
      Alert.alert(t('freelancer.publicProfile.settings.saveSuccessTitle'), t('freelancer.publicProfile.settings.saveSuccessMessage'));
      if (isPublic && slug) {
        router.push(`/freelancers/${slug}`);
      }
    } catch (err) {
      Alert.alert(
        t('freelancer.publicProfile.settings.saveErrorTitle'),
        err instanceof Error ? err.message : t('freelancer.publicProfile.settings.saveErrorMessage'),
      );
    }
  };

  if (profileQuery.isLoading) {
    return <LoadingState label={t('freelancer.publicProfile.settings.loading')} />;
  }

  if (profileQuery.isError) {
    const error = profileQuery.error as unknown;
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('freelancer.publicProfile.settings.loadError')}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 48 }}
        >
          <PageHeader
            title={t('freelancer.publicProfile.settings.title')}
            subtitle={t('freelancer.publicProfile.settings.subtitle')}
            onBack={() => router.back()}
          />

          <Card>
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  {t('freelancer.publicProfile.settings.enablePublic')}
                </Text>
                <Text className="mt-1 text-xs leading-4" style={{ color: colors.muted }}>
                  {t('freelancer.publicProfile.settings.enablePublicHint')}
                </Text>
              </View>
              <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>
          </Card>

          <Card>
            <View className="gap-4">
              <Input
                label={t('freelancer.publicProfile.settings.slugLabel')}
                value={slug}
                onChangeText={handleSlugChange}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="your-name"
                error={slugError ?? undefined}
              />
              <Text className="text-xs" style={{ color: colors.muted }}>
                {t('freelancer.publicProfile.settings.slugPreview', { url: publicPreview })}
              </Text>

              <Input
                label={t('freelancer.publicProfile.settings.titleLabel')}
                value={title}
                onChangeText={setTitle}
                placeholder={t('freelancer.publicProfile.settings.titlePlaceholder')}
                maxLength={120}
              />

              <Input
                label={t('freelancer.publicProfile.settings.bioLabel')}
                value={bio}
                onChangeText={setBio}
                placeholder={t('freelancer.publicProfile.settings.bioPlaceholder')}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="min-h-[120px]"
                maxLength={4000}
              />

              <Input
                label={t('freelancer.publicProfile.settings.hourlyRateLabel')}
                value={hourlyRateBaht}
                onChangeText={setHourlyRateBaht}
                keyboardType="decimal-pad"
                placeholder="800"
              />
              {hourlyRateBaht.trim() && bahtToSatang(hourlyRateBaht) != null ? (
                <Text className="text-xs" style={{ color: colors.muted }}>
                  {formatJobAmount(bahtToSatang(hourlyRateBaht)!)} / hr
                </Text>
              ) : null}
            </View>
          </Card>

          <Card>
            <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
              {t('freelancer.publicProfile.settings.skillsLabel')}
            </Text>
            <View className="mt-3 flex-row items-end gap-2">
              <View className="flex-1">
                <Input
                  value={skillDraft}
                  onChangeText={setSkillDraft}
                  placeholder={t('freelancer.publicProfile.settings.skillPlaceholder')}
                  onSubmitEditing={addSkill}
                  returnKeyType="done"
                />
              </View>
              <Pressable
                onPress={addSkill}
                className="mb-0.5 h-[52px] items-center justify-center rounded-xl px-4"
                style={{ backgroundColor: colors.primary }}
              >
                <Plus size={20} color="#fff" />
              </Pressable>
            </View>
            <View className="mt-3">
              <FreelancerSkillChips skills={skills} onRemove={removeSkill} />
            </View>
          </Card>

          <Card>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
                {t('freelancer.publicProfile.settings.servicesLabel')}
              </Text>
              <Pressable onPress={openServiceModal} className="flex-row items-center gap-1">
                <Plus size={16} color={colors.primary} />
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  {t('freelancer.publicProfile.settings.addService')}
                </Text>
              </Pressable>
            </View>

            <View className="mt-3 gap-3">
              {services.length === 0 ? (
                <Text className="text-sm" style={{ color: colors.muted }}>
                  {t('freelancer.publicProfile.settings.noServices')}
                </Text>
              ) : (
                services.map((service) => (
                  <View
                    key={service.key}
                    className="rounded-xl p-3"
                    style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
                  >
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="min-w-0 flex-1">
                        <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                          {service.title}
                        </Text>
                        {service.description ? (
                          <Text className="mt-1 text-xs leading-4" style={{ color: colors.muted }}>
                            {service.description}
                          </Text>
                        ) : null}
                        {service.priceBaht.trim() && bahtToSatang(service.priceBaht) != null ? (
                          <Text className="mt-2 text-sm font-bold" style={{ color: colors.primary }}>
                            {formatJobAmount(bahtToSatang(service.priceBaht)!)}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable onPress={() => removeService(service.key)} hitSlop={8}>
                        <Trash2 size={18} color={colors.danger} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </Card>

          <Button
            label={updateMutation.isPending ? t('freelancer.publicProfile.settings.saving') : t('freelancer.publicProfile.settings.save')}
            onPress={() => void handleSave()}
            disabled={updateMutation.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={serviceModalOpen} animationType="slide" transparent onRequestClose={() => setServiceModalOpen(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setServiceModalOpen(false)} />
          <View
            className="rounded-t-3xl px-4 pb-8 pt-4"
            style={{ backgroundColor: colors.card, gap: spacing.stackMd }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
              {t('freelancer.publicProfile.settings.addService')}
            </Text>
            <Input
              label={t('freelancer.publicProfile.settings.serviceName')}
              value={serviceTitle}
              onChangeText={setServiceTitle}
              maxLength={120}
            />
            <Input
              label={t('freelancer.publicProfile.settings.serviceDescription')}
              value={serviceDescription}
              onChangeText={setServiceDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="min-h-[88px]"
              maxLength={500}
            />
            <Input
              label={t('freelancer.publicProfile.settings.servicePrice')}
              value={servicePriceBaht}
              onChangeText={setServicePriceBaht}
              keyboardType="decimal-pad"
              placeholder="1500"
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  label={t('freelancer.publicProfile.settings.cancel')}
                  variant="secondary"
                  onPress={() => setServiceModalOpen(false)}
                />
              </View>
              <View className="flex-1">
                <Button label={t('freelancer.publicProfile.settings.addService')} onPress={addService} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
