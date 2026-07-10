export interface LogEntry {
  timestamp: string;
  level: string;
  service: string;
  message: string;
  pid: string | null;
}
