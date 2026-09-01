export type GoalStatus = 'active' | 'completed' | 'cancelled';

export type GoalLinkedRef = {
  id: string;
  key: string;
  titleEn: string;
  titleTh: string | null;
};

export type PlatformGoal = {
  id: string;
  userId: string;
  title: string;
  notes: string | null;
  status: GoalStatus;
  progressPct: number;
  lifeEventId: string | null;
  workflowTemplateId: string | null;
  lifeEvent?: GoalLinkedRef | null;
  workflowTemplate?: GoalLinkedRef | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

export type CreateGoalInput = {
  title: string;
  notes?: string | null;
  lifeEventId?: string | null;
  workflowTemplateId?: string | null;
  progressPct?: number;
};
