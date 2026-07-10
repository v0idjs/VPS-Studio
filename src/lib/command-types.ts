export interface Command {
  id: string;
  name: string;
  command: string;
  description: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  usage_count: number;
  last_used: string | null;
}

export interface CommandCategory {
  id: string;
  name: string;
  description: string;
  command_count: number;
}

export interface CommandHistoryEntry {
  id: string;
  command_id: string;
  server_id: string;
  executed_at: string;
  output: string | null;
  success: boolean;
  duration_ms: number;
}
