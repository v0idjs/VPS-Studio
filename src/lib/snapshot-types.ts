export interface Snapshot {
  id: string;
  name: string;
  created_at: string;
  server_id: string;
  hostname: string;
  kernel: string;
  uptime: string;
  packages: PackageSnapshot[];
  services: ServiceSnapshot[];
  network: NetworkSnapshot[];
  disk: DiskSnapshot[];
}

export interface PackageSnapshot {
  name: string;
  version: string;
}

export interface ServiceSnapshot {
  name: string;
  status: string;
  enabled: boolean;
}

export interface NetworkSnapshot {
  interface: string;
  ip: string;
  mac: string;
}

export interface DiskSnapshot {
  device: string;
  mount: string;
  size: string;
  used: string;
  available: string;
}

export interface SnapshotComparison {
  snapshot1_id: string;
  snapshot2_id: string;
  packages_diff: string[];
  services_diff: string[];
  network_diff: string[];
  disk_diff: string[];
}
