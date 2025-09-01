/*
  Reflects the structure of the app_tasks table in the database.
  Essentially the same as querying * from app_tasks
*/
export interface AppTask {
  id: number;
  task_name: string;
  interval: number;
  status: string;
  running: boolean; // Indicates if the task is currently running
  initiated_at: string | null;
  completed_at: string | null;
}