export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: "password" | "key" | "key_with_passphrase";
  password?: string;
  private_key?: string;
  passphrase?: string;
  group_name?: string;
  status: "online" | "offline" | "unknown" | "connecting";
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  theme: "dark" | "light";
  terminal_font_size: number;
  terminal_font_family: string;
  dashboard_refresh_interval: number;
  notification_enabled: boolean;
}

export interface ServerStats {
  server_id: string;
  hostname: string | null;
  os_name: string | null;
  os_version: string | null;
  kernel_version: string | null;
  uptime: string | null;
  cpu_usage: number | null;
  memory_total: number | null;
  memory_used: number | null;
  memory_usage: number | null;
  disk_total: number | null;
  disk_used: number | null;
  disk_usage: number | null;
  load_average: string | null;
  network_in: number | null;
  network_out: number | null;
  updated_at: string;
}

export interface ActivityEvent {
  id: number;
  server_id: string;
  server_name: string;
  activity_type: string;
  message: string;
  created_at: string;
}

export interface DashboardOverview {
  servers: ServerStats[];
  recent_activity: ActivityEvent[];
  total_servers: number;
  online_servers: number;
  offline_servers: number;
}

export interface TerminalSession {
  id: string;
  server_id: string;
  server_name: string;
  host: string;
  port: number;
  username: string;
  created_at: string;
}

export interface CreateTerminalSessionInput {
  server_id: string;
}

export interface AddServerInput {
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: "password" | "key" | "key_with_passphrase";
  password?: string;
  private_key?: string;
  passphrase?: string;
  group_name?: string;
}

export interface UpdateServerInput {
  id: string;
  name?: string;
  host?: string;
  port?: number;
  username?: string;
  auth_type?: "password" | "key" | "key_with_passphrase";
  password?: string;
  private_key?: string;
  passphrase?: string;
  group_name?: string;
}
