export interface FirewallRule {
  id: string;
  number: number;
  action: string;
  protocol: string;
  from_ip: string;
  to_ip: string;
  port: string;
  direction: string;
  enabled: boolean;
  comment: string;
}
