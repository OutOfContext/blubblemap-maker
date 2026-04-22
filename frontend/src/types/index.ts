export interface ProjectMetadata {
  title: string;
  description: string;
  author: string;
  categories: number;
  datasets: number;
}

export interface ProjectCreationRequest {
  type: 'BUBBLE_MAP';
  metadata: ProjectMetadata;
}

export interface SkillMapCreationRequest {
  type: 'SKILL_MAP';
  metadata: {
    title: string;
    description: string;
    author: string;
  };
}

export interface ProjectResponse {
  id: string;
  type: string;
  title: string;
  description: string;
  author: string;
  message: string;
}

export interface ProjectSummary {
  id: string;
  type: 'BUBBLE_MAP' | 'SKILL_MAP';
  title: string;
  description: string;
  author: string;
  createdAt: string;
}

export interface DatasetImportItem {
  name: string;
  category: string;
  value: number;
  description?: string;
}

export interface DatasetImportRequest {
  datasets: DatasetImportItem[];
}

export interface DatasetImportResponse {
  totalImported: number;
  successCount: number;
  errorCount: number;
  message: string;
}

export interface BubbleBubble {
  id: string;
  label: string;
  value: number;
  category: string;
  radius: number;
  color: string;
}

export interface BubbleMap {
  title: string;
  bubbles: BubbleBubble[];
  categories: string[];
  datasetCount: number;
}

// ── SkillMap types ────────────────────────────────────────────────────────────

export interface SkillBubble {
  id: string;
  label: string;
  value: number;
  category: string;
  subcategory?: string;
  radius: number;
  color: string;
  clusterAngle?: number;
  personNames?: string[];
}

export interface SkillMap {
  title: string;
  bubbles: SkillBubble[];
  categories: string[];
  personCount: number;
  skillCount: number;
}

export interface SkillMapPerson {
  id: string;
  name: string;
  sourceType: string;
  sourceUrl?: string;
  skillCount: number;
}


