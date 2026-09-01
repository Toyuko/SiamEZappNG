import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DemoModeBanner } from '../../components/smart-match/DemoModeBanner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { findFreelancer } from '../../features/matching/matching.service';
import { useMatchingStore } from '../../features/matching/matching.store';
import type { ChatMessage } from '../../features/matching/matching.types';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const EMPTY_THREAD: ChatMessage[] = [];

export function SmartMatchChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { matchId, booked } = useLocalSearchParams<{ matchId: string; booked?: string }>();
  const id = decodeURIComponent(String(matchId ?? ''));
  const match = useMatchingStore((s) => s.matches.find((item) => item.id === id));
  const messages = useMatchingStore((s) => s.messages);
  const thread = messages[id] ?? EMPTY_THREAD;
  const bookings = useMatchingStore((s) => s.bookings);
  const sendChat = useMatchingStore((s) => s.sendChat);
  const bookMatch = useMatchingStore((s) => s.bookMatch);
  const [draft, setDraft] = useState('');
  const freelancer = match ? findFreelancer(match.freelancerId) : undefined;
  const isBooked = bookings.some((item) => item.matchId === id) || booked === '1';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: 16, gap: spacing.stackMd, flex: 1 }}>
          <PageHeader
            title={freelancer ? `Chat with ${freelancer.name}` : 'Match chat'}
            subtitle={isBooked ? 'Booking confirmed in demo mode.' : `${match?.score ?? 0}% AI compatibility`}
            onBack={() => router.back()}
          />
          <DemoModeBanner />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
            {thread.map((message) => {
              const mine = message.sender === 'client';
              const system = message.sender === 'system';
              return (
                <View
                  key={message.id}
                  style={{
                    alignSelf: system ? 'center' : mine ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: system ? 'transparent' : mine ? siam.blue.DEFAULT : colors.card,
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: system ? 0 : 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: mine ? '#fff' : colors.foreground }}>{message.text}</Text>
                </View>
              );
            })}
          </ScrollView>
          {!isBooked ? (
            <Button
              label="Book this freelancer"
              variant="accent"
              gradient
              onPress={() => bookMatch(id)}
            />
          ) : (
            <Text style={{ color: colors.success, fontWeight: '800', textAlign: 'center' }}>Booking confirmed</Text>
          )}
          <Input value={draft} onChangeText={setDraft} placeholder="Write a message..." />
          <Button
            label="Send"
            onPress={() => {
              if (!draft.trim()) return;
              sendChat(id, draft.trim());
              setDraft('');
            }}
          />
          <Pressable onPress={() => router.push('/smart-match/matches')} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>All matches</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
