import type {
  ProjectCreationRequest,
  ProjectResponse,
  DatasetImportRequest,
  DatasetImportResponse,
  BubbleMap,
  ProjectSummary,
  SkillMapCreationRequest,
  SkillMapPerson,
  SkillMap,
} from '../types';

const BASE = '/api/projects';
const SKILL_BASE = '/api/skillmap';

// ── BubbleMap ─────────────────────────────────────────────────────────────────

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

// ── Project Overview ──────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<ProjectSummary[]> {
  const res = await fetch(`${BASE}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteProject(projectId: string): Promise<void> {
  const res = await fetch(`${BASE}/${projectId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}

// ── SkillMap ──────────────────────────────────────────────────────────────────

export async function createSkillMapProject(req: SkillMapCreationRequest): Promise<ProjectResponse> {
  const res = await fetch(`${SKILL_BASE}/projects/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function extractCv(projectId: string, file: File, name?: string): Promise<SkillMapPerson> {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);
  const res = await fetch(`${SKILL_BASE}/projects/${projectId}/persons/extract/cv`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function extractProfile(
  projectId: string,
  payload: { name: string; url: string; text: string }
): Promise<SkillMapPerson> {
  const res = await fetch(`${SKILL_BASE}/projects/${projectId}/persons/extract/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSkillMapPersons(projectId: string): Promise<SkillMapPerson[]> {
  const res = await fetch(`${SKILL_BASE}/projects/${projectId}/persons`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPersonSkillMap(projectId: string, personId: string): Promise<SkillMap> {
  const res = await fetch(`${SKILL_BASE}/projects/${projectId}/person/${personId}/skillmap`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getAggregatedSkillMap(projectId: string): Promise<SkillMap> {
  const res = await fetch(`${SKILL_BASE}/projects/${projectId}/aggregate`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePerson(projectId: string, personId: string): Promise<void> {
  const res = await fetch(`${SKILL_BASE}/projects/${projectId}/persons/${personId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}
