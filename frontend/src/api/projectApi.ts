import type {
  ProjectCreationRequest,
  ProjectResponse,
  DatasetImportRequest,
  DatasetImportResponse,
  BubbleMap,
} from '../types';

const BASE = '/api/projects';

export async function createProject(req: ProjectCreationRequest): Promise<ProjectResponse> {
  const res = await fetch(`${BASE}/create/bubblemap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function importDatasets(
  projectId: string,
  req: DatasetImportRequest
): Promise<DatasetImportResponse> {
  const res = await fetch(`${BASE}/${projectId}/datasets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function importCsv(
  projectId: string,
  file: File
): Promise<DatasetImportResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE}/${projectId}/datasets/csv`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getBubbleMap(projectId: string): Promise<BubbleMap> {
  const res = await fetch(`${BASE}/${projectId}/bubblemap`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

