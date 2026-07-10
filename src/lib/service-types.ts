export interface ServiceInfo {
  name: string;
  description: string;
  status: string;
  active_state: string;
  sub_state: string;
  load_state: string;
  pid: number | null;
  memory: string | null;
  cpu: string | null;
}
