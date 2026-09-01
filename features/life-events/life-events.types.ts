export type LifeEventStepStatus = 'pending' | 'started' | 'completed' | 'skipped';
export type LifeEventRunStatus = 'active' | 'completed' | 'abandoned';

export type LifeEventStepTarget = {
  serviceSlug?: string;
  listingType?: 'vehicle' | 'property';
  listingFilters?: {
    category?: string;
    listingType?: string;
    province?: string;
  };
  listingId?: string;
  href?: string;
};

export type LifeEventStep = {
  id: string;
  titleEn: string;
  titleTh: string | null;
  descriptionEn: string | null;
  descriptionTh: string | null;
  sortOrder: number;
  target: LifeEventStepTarget | Record<string, unknown> | null;
};

export type LifeEventDefinition = {
  id: string;
  key: string;
  titleEn: string;
  titleTh: string | null;
  descriptionEn: string | null;
  descriptionTh: string | null;
  active: boolean;
  sortOrder: number;
  steps: LifeEventStep[];
};

export type LifeEventStepProgress = {
  id: string;
  stepId: string;
  status: LifeEventStepStatus;
  startedAt: string | null;
  completedAt: string | null;
};

export type LifeEventRun = {
  id: string;
  lifeEventId: string;
  status: LifeEventRunStatus;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
  lifeEvent: LifeEventDefinition;
  steps: LifeEventStepProgress[];
};
