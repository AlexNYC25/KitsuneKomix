export interface AppTask {
  id: number;
  task_name: string;
  interval: number;
  status: string;
  initiated_at: string | null;
  completed_at: string | null;
}