import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { SelectField } from '../../components/ui/SelectField';
import type { CorporateApplicant, CorporateJobPosting, CorporateJobStatus } from '../../features/corporate/corporate.types';
import {
  useCorporateJobs,
  useDecideCorporateApplicant,
  useSubmitJobOpening,
} from '../../hooks/use-corporate-jobs';
import { isCorporateRole } from '../../lib/auth/role';
import { t } from '../../lib/i18n/i18n';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

const SKILL_OPTIONS = [
  { value: 'Legal', label: 'Legal' },
  { value: 'Translation', label: 'Translation' },
  { value: 'Thai paperwork', label: 'Thai paperwork' },
  { value: 'Project management', label: 'Project management' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Driving', label: 'Driving' },
];

const BUDGET_OPTIONS = [
  { value: '3000', label: '฿3,000' },
  { value: '5000', label: '฿5,000' },
  { value: '8500', label: '฿8,500' },
  { value: '15000', label: '฿15,000' },
  { value: '25000', label: '฿25,000' },
];

const DEADLINE_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
];

const STATUS_ORDER: CorporateJobStatus[] = ['OPEN', 'IN_PROGRESS'];

function ApplicantRow({
  applicant,
  selected,
  onSelect,
}: {
  applicant: CorporateApplicant;
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors } = useTheme();
  const initials = applicant.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable
      onPress={onSelect}
      className="flex-row items-center gap-3 rounded-xl px-3 py-3"
      style={{
        backgroundColor: selected ? 'rgba(44, 84, 198, 0.08)' : colors.background,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
      }}
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: siam.blue.DEFAULT }}
      >
        <Text className="text-sm font-bold" style={{ color: '#ffffff' }}>
          {initials}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
          {applicant.name}
        </Text>
        <View className="mt-1 flex-row flex-wrap gap-1">
          {applicant.skills.map((skill) => (
            <View
              key={skill}
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: 'rgba(255, 206, 45, 0.25)' }}
            >
              <Text className="text-[10px] font-semibold" style={{ color: siam.gray.dark }}>
                {skill}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Badge
        label={applicant.status}
        variant={applicant.status === 'HIRED' ? 'success' : applicant.status === 'DECLINED' ? 'error' : 'pending'}
      />
    </Pressable>
  );
}

function JobAccordion({
  job,
  expanded,
  onToggle,
  selectedApplicantId,
  onSelectApplicant,
}: {
  job: CorporateJobPosting;
  expanded: boolean;
  onToggle: () => void;
  selectedApplicantId: string | null;
  onSelectApplicant: (id: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <Card>
      <Pressable onPress={onToggle} accessibilityRole="button">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
              {job.title}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
              {t('corporate.jobs.applicantCount', { count: job.applicants.length })} · ฿
              {job.budget.toLocaleString()}
            </Text>
          </View>
          <Badge label={job.status.replace('_', ' ')} variant={job.status === 'OPEN' ? 'info' : 'pending'} />
        </View>
      </Pressable>

      {expanded ? (
        <View className="mt-4 gap-2">
          <Text className="text-sm leading-5" style={{ color: colors.muted }}>
            {job.description}
          </Text>
          {job.applicants.length === 0 ? (
            <EmptyState label={t('corporate.jobs.noApplicants')} />
          ) : (
            job.applicants.map((applicant) => (
              <ApplicantRow
                key={applicant.id}
                applicant={applicant}
                selected={selectedApplicantId === applicant.id}
                onSelect={() => onSelectApplicant(applicant.id)}
              />
            ))
          )}
        </View>
      ) : null}
    </Card>
  );
}

export function CorporateJobManagerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userRole, user, accessToken, isGuest } = useAuthStore();
  const isCorporate = isCorporateRole(userRole, user?.role);
  const jobsQuery = useCorporateJobs();
  const submitMutation = useSubmitJobOpening();
  const decideMutation = useDecideCorporateApplicant();

  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState(SKILL_OPTIONS[0].value);
  const [budget, setBudget] = useState(BUDGET_OPTIONS[2].value);
  const [deadlineDays, setDeadlineDays] = useState(DEADLINE_OPTIONS[1].value);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
      return;
    }
    if (userRole && !isCorporate) {
      router.replace(userRole === 'freelancer' ? '/(tabs)/freelancer' : '/(tabs)/dashboard');
    }
  }, [accessToken, isCorporate, isGuest, router, userRole]);

  const groupedJobs = useMemo(() => {
    const jobs = jobsQuery.data ?? [];
    return STATUS_ORDER.map((status) => ({
      status,
      jobs: jobs.filter((job) => job.status === status),
    })).filter((group) => group.jobs.length > 0);
  }, [jobsQuery.data]);

  const flatData = useMemo(() => {
    const rows: Array<{ type: 'header'; status: CorporateJobStatus } | { type: 'job'; job: CorporateJobPosting }> = [];
    for (const group of groupedJobs) {
      rows.push({ type: 'header', status: group.status });
      for (const job of group.jobs) {
        rows.push({ type: 'job', job });
      }
    }
    return rows;
  }, [groupedJobs]);

  const selectedJob = (jobsQuery.data ?? []).find((job) => job.id === expandedJobId);
  const selectedApplicant = selectedJob?.applicants.find((a) => a.id === selectedApplicantId);
  const canDecide = Boolean(selectedJob && selectedApplicant && selectedApplicant.status === 'PENDING');

  const handleDecision = async (decision: 'HIRE' | 'DECLINE') => {
    if (!selectedJob || !selectedApplicant) {
      return;
    }
    try {
      await decideMutation.mutateAsync({
        jobId: selectedJob.id,
        applicantId: selectedApplicant.id,
        decision,
      });
      await Haptics.notificationAsync(
        decision === 'HIRE'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      );
      setSelectedApplicantId(null);
      Alert.alert(
        decision === 'HIRE' ? t('corporate.jobs.hireSuccessTitle') : t('corporate.jobs.declineSuccessTitle'),
        decision === 'HIRE' ? t('corporate.jobs.hireSuccessMessage') : t('corporate.jobs.declineSuccessMessage'),
      );
    } catch (error) {
      Alert.alert(
        t('corporate.jobs.decisionErrorTitle'),
        error instanceof Error ? error.message : t('corporate.jobs.decisionErrorMessage'),
      );
    }
  };

  const handlePostJob = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(t('corporate.jobs.formIncompleteTitle'), t('corporate.jobs.formIncompleteMessage'));
      return;
    }
    const deadline = new Date(Date.now() + Number(deadlineDays) * 24 * 60 * 60 * 1000).toISOString();
    try {
      await submitMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
        skills: [skill],
        deadline,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPostModalOpen(false);
      setTitle('');
      setDescription('');
      Alert.alert(t('corporate.jobs.postSuccessTitle'), t('corporate.jobs.postSuccessMessage'));
    } catch (error) {
      Alert.alert(
        t('corporate.jobs.postErrorTitle'),
        error instanceof Error ? error.message : t('corporate.jobs.postErrorMessage'),
      );
    }
  };

  if (jobsQuery.isLoading) {
    return <LoadingState label={t('corporate.jobs.loading')} />;
  }

  if (jobsQuery.isError) {
    const error = jobsQuery.error as unknown;
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('corporate.jobs.loadError')}
        onRetry={() => void jobsQuery.refetch()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={flatData}
        keyExtractor={(item) => (item.type === 'header' ? `h-${item.status}` : item.job.id)}
        contentContainerStyle={{ padding: 16, gap: spacing.stackMd, paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={{ gap: spacing.sectionGap, marginBottom: spacing.stackMd }}>
            <PageHeader
              title={t('corporate.jobs.title')}
              subtitle={t('corporate.jobs.subtitle')}
              primaryCta={{ label: t('corporate.jobs.postNew'), onPress: () => setPostModalOpen(true) }}
            />
          </View>
        }
        ListEmptyComponent={<EmptyState label={t('corporate.jobs.empty')} />}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <Text className="mt-2 text-sm font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
                {item.status.replace('_', ' ')}
              </Text>
            );
          }
          return (
            <JobAccordion
              job={item.job}
              expanded={expandedJobId === item.job.id}
              onToggle={() => {
                setExpandedJobId((prev) => (prev === item.job.id ? null : item.job.id));
                setSelectedApplicantId(null);
              }}
              selectedApplicantId={expandedJobId === item.job.id ? selectedApplicantId : null}
              onSelectApplicant={setSelectedApplicantId}
            />
          );
        }}
      />

      <View
        className="absolute bottom-0 left-0 right-0 border-t px-4 pb-6 pt-3"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label={t('corporate.jobs.decline')}
              variant="secondary"
              disabled={!canDecide || decideMutation.isPending}
              onPress={() => void handleDecision('DECLINE')}
            />
          </View>
          <View className="flex-1">
            <Button
              label={t('corporate.jobs.hire')}
              gradient
              disabled={!canDecide || decideMutation.isPending}
              onPress={() => void handleDecision('HIRE')}
            />
          </View>
        </View>
      </View>

      <Modal visible={postModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPostModalOpen(false)}>
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
          <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.stackLg, paddingBottom: 40 }}>
            <PageHeader
              title={t('corporate.jobs.postModalTitle')}
              subtitle={t('corporate.jobs.postModalSubtitle')}
              onBack={() => setPostModalOpen(false)}
              backLabel={t('common.back')}
            />
            <Input label={t('corporate.jobs.fieldTitle')} value={title} onChangeText={setTitle} placeholder={t('corporate.jobs.fieldTitlePlaceholder')} />
            <Input
              label={t('corporate.jobs.fieldDescription')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('corporate.jobs.fieldDescriptionPlaceholder')}
              multiline
              numberOfLines={4}
              style={{ minHeight: 110, textAlignVertical: 'top' }}
            />
            <SelectField
              label={t('corporate.jobs.fieldSkills')}
              placeholder={t('corporate.jobs.fieldSkillsPlaceholder')}
              value={skill}
              onChange={setSkill}
              options={SKILL_OPTIONS}
            />
            <SelectField
              label={t('corporate.jobs.fieldBudget')}
              placeholder={t('corporate.jobs.fieldBudgetPlaceholder')}
              value={budget}
              onChange={setBudget}
              options={BUDGET_OPTIONS}
            />
            <SelectField
              label={t('corporate.jobs.fieldDeadline')}
              placeholder={t('corporate.jobs.fieldDeadlinePlaceholder')}
              value={deadlineDays}
              onChange={setDeadlineDays}
              options={DEADLINE_OPTIONS}
            />
            <Button
              label={submitMutation.isPending ? t('corporate.jobs.posting') : t('corporate.jobs.submitJob')}
              gradient
              disabled={submitMutation.isPending}
              onPress={() => void handlePostJob()}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
