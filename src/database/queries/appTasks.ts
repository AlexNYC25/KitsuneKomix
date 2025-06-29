import db from "../database.ts";
import { AppTask } from '../interfaces/appTask.ts';

export const GET_APP_TASK = `
  SELECT
    id,
    task_name,
    interval,
    status,
    initiated_at,
    completed_at
  FROM app_tasks
  WHERE task_name = ?;
`;

/**
 * Retrieves a specific application task by its name.
 * @param {string} taskName - The name of the task to retrieve.
 * @returns {AppTask | null} The application task if found, otherwise null.
 */
export function getAppTaskQuery(taskName: string): AppTask | null {
  const stmt = db.prepare(GET_APP_TASK);
  const row = stmt.get(taskName) as Record<string, unknown> | undefined;
  stmt.finalize();

  if (!row) {
    return null;
  }

  return {
    id: row.id as number,
    task_name: row.task_name as string,
    interval: row.interval as number,
    status: row.status as string,
    initiated_at: row.initiated_at as string | null,
    completed_at: row.completed_at as string | null,
  };
}

export const UPDATE_APP_TASK_STATUS = `
  UPDATE app_tasks
  SET status = ?, initiated_at = ?, completed_at = ?
  WHERE task_name = ?;
`;

/**
 * Updates the status of a specific application task.
 * @param {string} taskName - The name of the task to update.
 * @param {string} status - The new status for the task.
 * @param {string | null} initiatedAt - The timestamp when the task was initiated, or null if not applicable.
 * @param {string | null} completedAt - The timestamp when the task was completed, or null if not applicable.
 */
export function updateAppTaskStatus(taskName: string, status: string, initiatedAt: string | null, completedAt: string | null): void {
  const stmt = db.prepare(UPDATE_APP_TASK_STATUS);
  stmt.run(status, initiatedAt, completedAt, taskName);
  stmt.finalize();
}