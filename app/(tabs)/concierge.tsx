import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PageHeader } from '../../components/ui/PageHeader';
import {
  sendConciergeMessage,
  type ConciergeHistoryItem,
} from '../../features/concierge/concierge.api';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type ChatBubble = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTED = [
  'I want to move to Thailand',
  'Find a motorcycle under 100,000 baht',
  'Help me register a vehicle',
  'Show property for rent in Bangkok',
];

export default function ConciergeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((s) => s.language);
  const locale = language === 'th' ? 'th' : 'en';
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi — I am the SiamEZ Concierge. Ask about services, vehicles, property, or life events.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

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
      const extras = [
        ...(reply.recommendations ?? []).map((r) => `• ${r.name}`),
        ...(reply.deepLinks ?? []).map((l) => `→ ${l.label}`),
      ].join('\n');
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: extras
            ? `${reply.content}\n\n${extras}`
            : reply.content,
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
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <PageHeader
          title="AI Concierge"
          subtitle="Same Platform Concierge engine — services, marketplace, life events."
        />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
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
              backgroundColor:
                item.role === 'user' ? colors.primary : colors.card,
              borderWidth: item.role === 'user' ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-sm leading-5"
              style={{
                color: item.role === 'user' ? '#ffffff' : colors.foreground,
              }}
            >
              {item.content}
            </Text>
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
            <Pressable
              onPress={() => router.push('/(tabs)/life-events')}
              className="rounded-full border px-3 py-1.5"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-xs" style={{ color: colors.primary }}>
                Open Life Events
              </Text>
            </Pressable>
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
          style={{
            backgroundColor: colors.primary,
            opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-sm font-semibold text-white">Send</Text>
          )}
        </Pressable>
      </View>
      <View style={{ height: spacing.stackSm }} />
    </SafeAreaView>
  );
}
