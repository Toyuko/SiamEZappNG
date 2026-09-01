import { CATEGORY_LABELS, DEFAULT_FILTERS, DEMO_CLIENT, EMPTY_JOB_DRAFT } from './matching.constants';
import { applyMatchFilters, expansionHints } from './matching.filters';
import { MOCK_FREELANCERS, PREBUILT_DEMO_JOBS } from './matching.mock-data';
import { parseJobDescription } from './matching.parser';
import { getMatchingProvider } from './matching.provider';
import { STRONG_MATCH_MIN } from './matching.constants';
import type {
  CelebrationPayload,
  ChatMessage,
  DemoBooking,
  DemoRole,
  FreelancerProfile,
  Job,
  JobDraft,
  MatchActionKind,
  MatchFilters,
  MatchRecord,
  ParsedJob,
  RankedMatch,
} from './matching.types';

export type MatchingState = {
  role: DemoRole;
  viewerFreelancerId: string;
  jobs: Job[];
  currentJobId: string | null;
  matches: MatchRecord[];
  savedFreelancerIds: string[];
  filters: MatchFilters;
  messages: Record<string, ChatMessage[]>;
  bookings: DemoBooking[];
  lastCelebration: CelebrationPayload | null;
  parsedDraft: ParsedJob | null;
  history: Array<{ matchId: string; side: 'client' | 'freelancer'; previous: MatchActionKind }>;
};

function nowIso(): string {
  return new Date().toISOString();
}

function cloneFreelancers(): FreelancerProfile[] {
  return MOCK_FREELANCERS.map((item) => ({
    ...item,
    skills: [...item.skills],
    languages: [...item.languages],
    certifications: [...item.certifications],
    preferredJobTypes: [...item.preferredJobTypes],
    reviews: item.reviews.map((review) => ({ ...review })),
    portfolio: item.portfolio.map((entry) => ({ ...entry })),
  }));
}

export function getFreelancers(): FreelancerProfile[] {
  return cloneFreelancers();
}

export function findFreelancer(id: string): FreelancerProfile | undefined {
  return MOCK_FREELANCERS.find((item) => item.id === id);
}

function upsertMatch(matches: MatchRecord[], next: MatchRecord): MatchRecord[] {
  const index = matches.findIndex((item) => item.id === next.id);
  if (index === -1) return [...matches, next];
  const copy = [...matches];
  copy[index] = next;
  return copy;
}

function deriveStatus(clientAction: MatchActionKind, freelancerAction: MatchActionKind): MatchRecord['status'] {
  if (clientAction === 'passed' || freelancerAction === 'passed') return 'passed';
  if (
    (clientAction === 'liked' || clientAction === 'super_liked') &&
    (freelancerAction === 'liked' || freelancerAction === 'super_liked')
  ) {
    return 'matched';
  }
  if (clientAction !== 'pending' || freelancerAction !== 'pending') return 'liked';
  return 'pending';
}

function withMutualMatch(match: MatchRecord, freelancer: FreelancerProfile | undefined, job: Job | undefined): {
  match: MatchRecord;
  celebration: CelebrationPayload | null;
} {
  const status = deriveStatus(match.clientAction, match.freelancerAction);
  const matched = status === 'matched';
  const next: MatchRecord = {
    ...match,
    status,
    matchedAt: matched ? match.matchedAt ?? nowIso() : null,
  };
  if (!matched || !freelancer || !job) {
    return { match: next, celebration: null };
  }
  return {
    match: next,
    celebration: {
      matchId: next.id,
      freelancerName: freelancer.name,
      freelancerPhoto: freelancer.profilePhoto,
      category: freelancer.category,
      score: next.score,
      jobTitle: job.title,
    },
  };
}

function simulateFreelancerReply(match: MatchRecord, freelancer: FreelancerProfile, action: MatchActionKind): MatchRecord {
  if (action === 'passed') return match;
  if (match.freelancerAction !== 'pending') return match;
  const threshold = action === 'super_liked' ? Math.max(70, freelancer.autoAcceptThreshold - 8) : freelancer.autoAcceptThreshold;
  if (match.score >= threshold) {
    return { ...match, freelancerAction: 'liked' };
  }
  return match;
}

export function createInitialDemoState(): MatchingState {
  return {
    role: 'client',
    viewerFreelancerId: 'fl-mike',
    jobs: PREBUILT_DEMO_JOBS.map((job) => ({ ...job, requiredSkills: [...job.requiredSkills], languages: [...job.languages] })),
    currentJobId: null,
    matches: [],
    savedFreelancerIds: [],
    filters: { ...DEFAULT_FILTERS },
    messages: {},
    bookings: [],
    lastCelebration: null,
    parsedDraft: null,
    history: [],
  };
}

export function emptyJobDraft(): JobDraft {
  return {
    ...EMPTY_JOB_DRAFT,
    requiredSkills: [...EMPTY_JOB_DRAFT.requiredSkills],
    languages: [...EMPTY_JOB_DRAFT.languages],
  };
}

export function draftFromParsed(parsed: ParsedJob): JobDraft {
  return {
    ...emptyJobDraft(),
    category: parsed.category,
    location: parsed.location ?? 'Bangkok',
    province: parsed.province ?? parsed.location ?? 'Bangkok',
    locationMode: parsed.locationMode,
    urgency: parsed.urgency ?? 'asap',
    specificDate: parsed.specificDate ?? '',
    budgetMin: parsed.budgetMin != null ? String(parsed.budgetMin) : '',
    budgetMax: parsed.budgetMax != null ? String(parsed.budgetMax) : '',
    experienceRequired: parsed.experienceRequired ?? 'any',
    description: parsed.description,
    requiredSkills: parsed.skills,
    languages: parsed.languages,
    remoteOk: parsed.locationMode === 'remote',
    sourceText: parsed.description,
  };
}

export function parseJobFromText(text: string): ParsedJob {
  return getMatchingProvider().parseJob(text);
}

export function jobFromDraft(draft: JobDraft, id?: string): Job {
  const category = draft.category ?? 'motorbike_mechanic';
  const budgetMin = draft.budgetMin.trim() ? Number(draft.budgetMin.replace(/,/g, '')) : null;
  const budgetMax = draft.budgetMax.trim() ? Number(draft.budgetMax.replace(/,/g, '')) : null;
  const title = `${CATEGORY_LABELS[category]} needed in ${draft.location || 'Thailand'}`;
  return {
    id: id ?? `job-${Date.now()}`,
    clientId: DEMO_CLIENT.id,
    clientName: DEMO_CLIENT.name,
    category,
    title,
    description: draft.description.trim() || title,
    location: draft.location.trim() || 'Bangkok',
    province: draft.province.trim() || draft.location.trim() || 'Bangkok',
    locationMode: draft.locationMode,
    budgetMin: Number.isFinite(budgetMin) ? budgetMin : null,
    budgetMax: Number.isFinite(budgetMax) ? budgetMax : null,
    urgency: draft.urgency,
    specificDate: draft.specificDate.trim() || null,
    requiredSkills: draft.requiredSkills.length ? draft.requiredSkills : [CATEGORY_LABELS[category]],
    experienceRequired: draft.experienceRequired,
    languages: draft.languages,
    remoteOk: draft.remoteOk || draft.locationMode === 'remote',
    status: 'open',
    createdAt: nowIso(),
    sourceText: draft.sourceText || draft.description,
  };
}

export function createJob(state: MatchingState, job: Job): MatchingState {
  const ranked = getMatchingProvider().matchJob(job, MOCK_FREELANCERS);
  const matches = ranked.reduce((acc, item) => {
    if (acc.some((existing) => existing.id === item.match.id)) return acc;
    return [...acc, item.match];
  }, state.matches);
  const jobs = [...state.jobs.filter((item) => item.id !== job.id), job];
  return {
    ...state,
    jobs,
    currentJobId: job.id,
    matches,
    lastCelebration: null,
  };
}

export function rankedForJob(state: MatchingState, jobId: string, opts?: { strongOnly?: boolean }): RankedMatch[] {
  const job = state.jobs.find((item) => item.id === jobId);
  if (!job) return [];
  const ranked = getMatchingProvider().matchJob(job, MOCK_FREELANCERS);
  const withStore = ranked.map((item) => {
    const stored = state.matches.find((match) => match.id === item.match.id);
    return stored ? { ...item, match: { ...item.match, ...stored, scoreBreakdown: stored.scoreBreakdown } } : item;
  });
  const actionable = withStore.filter((item) => item.match.clientAction === 'pending');
  const filtered = applyMatchFilters(actionable, state.filters);
  if (opts?.strongOnly) {
    return filtered.filter((item) => item.result.score >= STRONG_MATCH_MIN);
  }
  return filtered;
}

export function rankedJobsForFreelancer(state: MatchingState): RankedMatch[] {
  const freelancer = findFreelancer(state.viewerFreelancerId);
  if (!freelancer) return [];
  const ranked = getMatchingProvider().matchFreelancer(freelancer, state.jobs);
  return ranked
    .map((item) => {
      const stored = state.matches.find((match) => match.id === item.match.id);
      return stored ? { ...item, match: { ...item.match, ...stored } } : item;
    })
    .filter((item) => item.match.freelancerAction === 'pending' && item.job.status === 'open');
}

export function likeFreelancer(state: MatchingState, freelancerId: string, kind: 'liked' | 'super_liked' = 'liked'): MatchingState {
  const job = state.jobs.find((item) => item.id === state.currentJobId);
  const freelancer = findFreelancer(freelancerId);
  if (!job || !freelancer) return state;
  const existing =
    state.matches.find((item) => item.jobId === job.id && item.freelancerId === freelancerId) ??
    getMatchingProvider().matchJob(job, [freelancer])[0]?.match;
  if (!existing) return state;

  const previous = existing.clientAction;
  let next = { ...existing, clientAction: kind };
  next = simulateFreelancerReply(next, freelancer, kind);
  const resolved = withMutualMatch(next, freelancer, job);

  const messages = { ...state.messages };
  if (resolved.celebration && !messages[resolved.match.id]) {
    messages[resolved.match.id] = [
      {
        id: `sys-${resolved.match.id}`,
        matchId: resolved.match.id,
        sender: 'system',
        text: `You matched with ${freelancer.name}. Say hello and book when you are ready.`,
        createdAt: nowIso(),
      },
    ];
  }

  return {
    ...state,
    matches: upsertMatch(state.matches, resolved.match),
    lastCelebration: resolved.celebration ?? state.lastCelebration,
    messages,
    savedFreelancerIds:
      kind === 'super_liked' && !state.savedFreelancerIds.includes(freelancerId)
        ? [...state.savedFreelancerIds, freelancerId]
        : state.savedFreelancerIds,
    history: [...state.history, { matchId: resolved.match.id, side: 'client', previous }],
  };
}

export function passFreelancer(state: MatchingState, freelancerId: string): MatchingState {
  const job = state.jobs.find((item) => item.id === state.currentJobId);
  const freelancer = findFreelancer(freelancerId);
  if (!job || !freelancer) return state;
  const existing =
    state.matches.find((item) => item.jobId === job.id && item.freelancerId === freelancerId) ??
    getMatchingProvider().matchJob(job, [freelancer])[0]?.match;
  if (!existing) return state;
  const next = { ...existing, clientAction: 'passed' as const, status: 'passed' as const };
  return {
    ...state,
    matches: upsertMatch(state.matches, next),
    history: [...state.history, { matchId: next.id, side: 'client', previous: existing.clientAction }],
  };
}

export function likeJob(state: MatchingState, jobId: string): MatchingState {
  const job = state.jobs.find((item) => item.id === jobId);
  const freelancer = findFreelancer(state.viewerFreelancerId);
  if (!job || !freelancer) return state;
  const existing =
    state.matches.find((item) => item.jobId === job.id && item.freelancerId === freelancer.id) ??
    getMatchingProvider().matchFreelancer(freelancer, [job])[0]?.match;
  if (!existing) return state;
  const next = { ...existing, freelancerAction: 'liked' as const };
  const resolved = withMutualMatch(next, freelancer, job);
  const messages = { ...state.messages };
  if (resolved.celebration && !messages[resolved.match.id]) {
    messages[resolved.match.id] = [
      {
        id: `sys-${resolved.match.id}`,
        matchId: resolved.match.id,
        sender: 'system',
        text: `${freelancer.name} accepted this job. You can start a conversation.`,
        createdAt: nowIso(),
      },
    ];
  }
  return {
    ...state,
    matches: upsertMatch(state.matches, resolved.match),
    lastCelebration: resolved.celebration ?? state.lastCelebration,
    messages,
    history: [...state.history, { matchId: resolved.match.id, side: 'freelancer', previous: existing.freelancerAction }],
  };
}

export function passJob(state: MatchingState, jobId: string): MatchingState {
  const job = state.jobs.find((item) => item.id === jobId);
  const freelancer = findFreelancer(state.viewerFreelancerId);
  if (!job || !freelancer) return state;
  const existing =
    state.matches.find((item) => item.jobId === job.id && item.freelancerId === freelancer.id) ??
    getMatchingProvider().matchFreelancer(freelancer, [job])[0]?.match;
  if (!existing) return state;
  const next = { ...existing, freelancerAction: 'passed' as const, status: 'passed' as const };
  return {
    ...state,
    matches: upsertMatch(state.matches, next),
    history: [...state.history, { matchId: next.id, side: 'freelancer', previous: existing.freelancerAction }],
  };
}

export function undoLast(state: MatchingState): MatchingState {
  const last = state.history[state.history.length - 1];
  if (!last) return state;
  const match = state.matches.find((item) => item.id === last.matchId);
  if (!match) return { ...state, history: state.history.slice(0, -1) };
  const reverted: MatchRecord =
    last.side === 'client'
      ? { ...match, clientAction: last.previous, status: deriveStatus(last.previous, match.freelancerAction), matchedAt: null }
      : { ...match, freelancerAction: last.previous, status: deriveStatus(match.clientAction, last.previous), matchedAt: null };
  return {
    ...state,
    matches: upsertMatch(state.matches, reverted),
    lastCelebration: null,
    history: state.history.slice(0, -1),
  };
}

export function saveFreelancer(state: MatchingState, freelancerId: string): MatchingState {
  if (state.savedFreelancerIds.includes(freelancerId)) return state;
  return { ...state, savedFreelancerIds: [...state.savedFreelancerIds, freelancerId] };
}

export function getMatches(state: MatchingState): MatchRecord[] {
  return state.matches.filter((item) => item.status === 'matched');
}

export function sendMessage(state: MatchingState, matchId: string, sender: ChatMessage['sender'], text: string): MatchingState {
  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    matchId,
    sender,
    text,
    createdAt: nowIso(),
  };
  const thread = state.messages[matchId] ?? [];
  return { ...state, messages: { ...state.messages, [matchId]: [...thread, message] } };
}

export function createBooking(state: MatchingState, matchId: string): MatchingState {
  const match = state.matches.find((item) => item.id === matchId);
  if (!match) return state;
  const booking: DemoBooking = {
    id: `book-${Date.now()}`,
    matchId,
    jobId: match.jobId,
    freelancerId: match.freelancerId,
    status: 'confirmed',
    createdAt: nowIso(),
  };
  return { ...state, bookings: [...state.bookings, booking] };
}

export function setFilters(state: MatchingState, patch: Partial<MatchFilters>): MatchingState {
  return { ...state, filters: { ...state.filters, ...patch } };
}

export function setRole(state: MatchingState, role: DemoRole): MatchingState {
  return { ...state, role, lastCelebration: null };
}

export function setViewerFreelancer(state: MatchingState, freelancerId: string): MatchingState {
  return { ...state, viewerFreelancerId: freelancerId, role: 'freelancer', lastCelebration: null };
}

export function dismissCelebration(state: MatchingState): MatchingState {
  return { ...state, lastCelebration: null };
}

export function noMatchHints(state: MatchingState, jobId: string): string[] {
  const ranked = rankedForJob(state, jobId, { strongOnly: false });
  const top = ranked[0]?.result.score ?? null;
  return expansionHints(top);
}
