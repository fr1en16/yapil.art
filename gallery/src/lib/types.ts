export type FileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'archive'
  | 'code'
  | 'document'
  | 'other';

export interface R2File {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  type: FileType;
  url: string;
  extension: string;
}

export interface FilesApiResponse {
  currentPrefix: string;
  folders: string[];
  files: R2File[];
  isConfigured?: boolean;
  error?: string;
}

export type SortField = 'name' | 'date' | 'size';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'masonry' | 'grid' | 'list';
export type GridSize = 'small' | 'medium' | 'large';
