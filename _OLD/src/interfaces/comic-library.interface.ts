
export interface ComicLibrary {
  id: number;
  name: string;
  path: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  newFilesCount?: number;  // For tracking during parsing
  skippedFilesCount?: number;  // For tracking during parsing
}