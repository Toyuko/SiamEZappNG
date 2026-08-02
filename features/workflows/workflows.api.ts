import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export type WorkflowTemplate = {
  id: string;
  key: string;
  titleEn: string;
  titleTh: string | null;
  descriptionEn: string | null;
  descriptionTh: string | null;
  active: boolean;
  steps?: Array<{
    id: string;
    titleEn: string;
    titleTh: string | null;
    sortOrder: number;
  }>;
};

export type WorkflowRun = {
  id: string;
  templateId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  template?: WorkflowTemplate;
  steps?: Array<{
    id: string;
    status: string;
    templateStepId: string;
    templateStep?: { id: string; titleEn: string; titleTh: string | null };
  }>;
};

export async function fetchWorkflowTemplates() {
  const response = await api.get<
    WorkflowTemplate[] | ApiEnvelope<WorkflowTemplate[]>
  >('/api/v1/workflow-templates');
  return unwrapApiData(response);
}

export async function fetchMyWorkflowRuns() {
  const response = await api.get<WorkflowRun[] | ApiEnvelope<WorkflowRun[]>>(
    '/api/v1/workflows/runs'
  );
  return unwrapApiData(response);
}

export async function startWorkflow(templateId: string) {
  const response = await api.post<WorkflowRun | ApiEnvelope<WorkflowRun>>(
    '/api/v1/workflows/runs',
    { templateId }
  );
  return unwrapApiData(response);
}

export async function advanceWorkflowStep(stepRunId: string) {
  const response = await api.post(
    `/api/v1/workflows/steps/${stepRunId}/advance`
  );
  return unwrapApiData(response);
}

export async function cancelWorkflow(runId: string) {
  const response = await api.delete(`/api/v1/workflows/runs/${runId}`);
  return unwrapApiData(response);
}
