import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PageHeader } from '../../components/ui/PageHeader';
import {
  sendConciergeMessage,
  type ConciergeDeepLink,
  type ConciergeHistoryItem,
  type ConciergeServiceRecommendation,
} from '../../features/concierge/concierge.api';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type ChatBubble = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: ConciergeServiceRecommendation[];
  deepLinks?: ConciergeDeepLink[];
  explanations?: string[];
  goalChangeLabel?: string | null;
};

const SUGGESTED = [
  'I want to move to Thailand',
  'Find a motorcycle under 100,000 baht',
  'Help me register a vehicle',
  'Show property for rent in Bangkok',
];

function openDeepLink(router: ReturnType<typeof useRouter>, href: string) {
  const path = href.replace(/^\/(en|th)/, '') || href;
  if (path.startsWith('/sales/')) {
    router.push(`/sales/${path.split('/').pop()}`);
    return;
  }
  if (path.startsWith('/real-estate/')) {
    router.push(`/real-estate/${path.split('/').pop()}`);
    return;
  }
  if (path.startsWith('/services/') || path.startsWith('/book/')) {
    const slug = path.split('/').pop();
    if (slug) router.push(`/services/${slug}`);
    return;
  }
  if (path.includes('life-event') || path.includes('goals')) {
    router.push('/(tabs)/life-events');
    return;
  }
  router.push('/(tabs)/services');
}

export default function ConciergeScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useTheme();
  const language = useLanguageStore((s) => s.language);
  const locale = language === 'th' ? 'th' : 'en';
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi — I am the SiamEZ Concierge. I remember your journey across this conversation and sync with Platform 2.1.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [primaryGoal, setPrimaryGoal] = useState<string | null>(null);

  const history = useMemo<ConciergeHistoryItem[]>(
    () =>
      messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setDraft('');
    const userMsg: ChatBubble = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const reply = await sendConciergeMessage({
        message: trimmed,
        locale,
        history,
      });
      if (reply.journey?.primaryGoalKey) {
        const label =
          reply.journey.activeGoals.find((g) => g.key === reply.journey?.primaryGoalKey)
            ?.label ?? reply.journey.primaryGoalKey;
        setPrimaryGoal(label);
      }
      const goalChangeLabel =
        reply.goalChange?.changed && reply.goalChange.toLabel
          ? `Goal updated → ${reply.goalChange.toLabel}`
          : null;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply.content,
          recommendations: reply.recommendations,
          deepLinks: reply.deepLinks,
          explanations: reply.explanations,
          goalChangeLabel,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content:
            error instanceof Error
              ? `Sorry — ${error.message}`
              : 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? tabBarHeight : 0}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <PageHeader
            title="AI Concierge"
            subtitle={
              primaryGoal
                ? `Journey focus: ${primaryGoal}`
                : 'Platform 2.1 — journey memory, explained recommendations, deep links.'
            }
          />
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{
            padding: 16,
            gap: 10,
            paddingBottom: 12,
            flexGrow: 1,
          }}
          renderItem={({ item }) => (
          <View
            className="max-w-[92%] rounded-2xl px-3 py-2.5"
            style={{
              alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: item.role === 'user' ? colors.primary : colors.card,
              borderWidth: item.role === 'user' ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-sm leading-5"
              style={{ color: item.role === 'user' ? '#ffffff' : colors.foreground }}
            >
              {item.content}
            </Text>

            {item.goalChangeLabel ? (
              <Text className="mt-2 text-xs font-semibold" style={{ color: colors.primary }}>
                {item.goalChangeLabel}
              </Text>
            ) : null}

            {(item.explanations ?? []).length > 0 ? (
              <View className="mt-2 gap-1">
                {item.explanations!.map((line) => (
                  <Text key={line} className="text-xs leading-4" style={{ color: colors.muted }}>
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}

            {(item.recommendations ?? []).length > 0 ? (
              <View className="mt-2 gap-1.5">
                {item.recommendations!.map((rec) => (
                  <Pressable
                    key={rec.slug}
                    onPress={() => router.push(`/services/${rec.slug}`)}
                    className="rounded-lg border px-2 py-1.5"
                    style={{ borderColor: colors.border }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: colors.foreground }}>
                      {rec.name}
                    </Text>
                    {rec.reason ? (
                      <Text className="mt-0.5 text-[11px]" style={{ color: colors.muted }}>
                        {rec.reason}
                      </Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}

            {(item.deepLinks ?? []).length > 0 ? (
              <View className="mt-2 flex-row flex-wrap gap-1.5">
                {item.deepLinks!.map((link) => (
                  <Pressable
                    key={`${link.kind}-${link.href}`}
                    onPress={() => openDeepLink(router, link.href)}
                    className="rounded-full border px-2.5 py-1"
                    style={{ borderColor: colors.border }}
                  >
                    <Text className="text-[11px] font-medium" style={{ color: colors.primary }}>
                      {link.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}
        ListFooterComponent={
          <View className="mt-2 flex-row flex-wrap gap-2">
            {SUGGESTED.map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() => void send(prompt)}
                className="rounded-full border px-3 py-1.5"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-xs" style={{ color: colors.muted }}>
                  {prompt}
                </Text>
              </Pressable>
            ))}
          </View>
        }
        />

        <View
          className="flex-row items-end gap-2 border-t px-3 py-3"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask Concierge…"
            placeholderTextColor={colors.muted}
            multiline
            className="max-h-28 flex-1 rounded-xl border px-3 py-2 text-sm"
            style={{
              borderColor: colors.border,
              color: colors.foreground,
              backgroundColor: colors.background,
            }}
          />
          <Pressable
            onPress={() => void send(draft)}
            disabled={sending}
            className="h-11 items-center justify-center rounded-xl px-4"
            style={{ backgroundColor: colors.primary, opacity: sending ? 0.6 : 1 }}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-sm font-semibold text-white">Send</Text>
            )}
          </Pressable>
        </View>
        <View style={{ height: spacing.stackSm }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
