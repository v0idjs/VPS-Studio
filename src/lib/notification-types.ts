export interface NotificationRule {
  id: string;
  name: string;
  event_type: string;
  condition: string;
  server_ids: string[];
  enabled: boolean;
  notify_desktop: boolean;
  notify_sound: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationEntry {
  id: string;
  rule_id: string;
  server_id: string;
  event_type: string;
  message: string;
  severity: string;
  timestamp: string;
  read: boolean;
}
