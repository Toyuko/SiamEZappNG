import AsyncStorage from '@react-native-async-storage/async-storage';

import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import { CONCIERGE_JOURNEY_KEY } from '../../lib/session/clear-user-local-data';
import type {
  ConciergeHistoryItem,
  ConciergeJourneyContext,
  ConciergeLocale,
  ConciergeReply,
} from './concierge.types';

const JOURNEY_KEY = CONCIERGE_JOURNEY_KEY;

export type {
  ConciergeDeepLink,
  ConciergeHistoryItem,
  ConciergeJourneyContext,
  ConciergeLocale,
  ConciergeReply,
  ConciergeServiceRecommendation,
  GoalChangeSignal,
} from './concierge.types';

export async function loadConciergeJourney(): Promise<ConciergeJourneyContext | null> {
  try {
    const raw = await AsyncStorage.getItem(JOURNEY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConciergeJourneyContext;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveConciergeJourney(
  journey: ConciergeJourneyContext | null | undefined
) {
  if (!journey) return;
  try {
    await AsyncStorage.setItem(JOURNEY_KEY, JSON.stringify(journey));
  } catch {
    // Best-effort local persistence.
  }
}

export async function clearConciergeJourney() {
  try {
    await AsyncStorage.removeItem(JOURNEY_KEY);
  } catch {
    // ignore
  }
}

export async function sendConciergeMessage(input: {
  message: string;
  locale?: ConciergeLocale;
  history?: ConciergeHistoryItem[];
  journey?: ConciergeJourneyContext | null;
}) {
  const journey =
    input.journey === undefined ? await loadConciergeJourney() : input.journey;

  const response = await api.post<ConciergeReply | ApiEnvelope<ConciergeReply>>(
    '/api/v1/concierge/chat',
    {
      message: input.message,
      locale: input.locale ?? 'en',
      history: input.history ?? [],
      journey: journey ?? null,
    }
  );
  const reply = unwrapApiData(response);
  if (reply.journey) {
    await saveConciergeJourney(reply.journey);
  }
  return reply;
}
