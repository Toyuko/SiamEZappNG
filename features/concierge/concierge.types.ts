export type ConciergeLocale = 'en' | 'th';

export type JourneyTopic =
  | 'vehicle'
  | 'motorcycle'
  | 'property'
  | 'services'
  | 'life_event'
  | 'workflow'
  | 'general';

export type JourneyGoalHint = {
  key: string;
  label: string;
  source: 'message' | 'life_event' | 'goal' | 'booking' | 'engagement';
};

/** Platform 2.1 journey memory — persist and resend with each chat turn. */
export type ConciergeJourneyContext = {
  version: 1;
  topics: JourneyTopic[];
  activeGoals: JourneyGoalHint[];
  previousGoalKey: string | null;
  primaryGoalKey: string | null;
  messageCount: number;
  lastUserMessage: string | null;
  updatedAt: string;
};

export type GoalChangeSignal = {
  changed: boolean;
  fromKey: string | null;
  toKey: string | null;
  fromLabel: string | null;
  toLabel: string | null;
};

export type ConciergeDeepLink = {
  href: string;
  label: string;
  kind: 'listing' | 'service' | 'life_event' | 'search';
  reason?: string;
};

export type ConciergeServiceRecommendation = {
  slug: string;
  name: string;
  shortDescription: string;
  score?: number;
  reason?: string;
};

export type ConciergeReply = {
  content: string;
  recommendations: ConciergeServiceRecommendation[];
  deepLinks?: ConciergeDeepLink[];
  mode: 'rule' | 'llm' | 'mock-stream';
  journey?: ConciergeJourneyContext;
  goalChange?: GoalChangeSignal;
  explanations?: string[];
};

export type ConciergeHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};
