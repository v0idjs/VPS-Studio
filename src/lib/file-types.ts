export interface FileInfo {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  permissions: string;
  modified: string;
}

export interface FileBookmark {
  id: number;
  server_id: string;
  path: string;
  name: string;
  created_at: string;
}
