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

export interface ProjectResponse {
  id: string;
  type: string;
  title: string;
  description: string;
  author: string;
  message: string;
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

