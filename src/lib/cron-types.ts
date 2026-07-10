export interface CronJob {
  id: string;
  schedule: string;
  command: string;
  enabled: boolean;
}
