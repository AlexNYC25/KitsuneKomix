
import { getAppTaskQuery, updateAppTaskStatus } from "../database/queries/appTasks.ts";
import { parseComicsDirectory } from "../services/comicsParser.ts";

import logger from "../utilities/logger.ts";

export function startBackgroundComicsParser() {
  const taskName = "comic_parser";
  // NOTE: an in-memory lock to prevent concurrent execution of the task, this is on top of the database flag, in the event of db update delays
  let isRunning = false;

  setInterval(() => {
    if (isRunning) {
      logger.warn(`Background Task "${taskName}" is already running (in-memory lock). Skipping this interval.`);
      return;
    }

    const task = getAppTaskQuery(taskName);
    if (!task) {
      logger.error(`Task "${taskName}" not found in the database.`);
      return;
    }
    if (task.running) {
      logger.warn(`Background Task "${task.task_name}" is already running (DB flag). Skipping this interval.`);
      return;
    }

    isRunning = true;

    try {
      logger.info(`Background Task "${task.task_name}" is starting with interval ${task.interval} milliseconds`);

      const now = new Date().toISOString();
      updateAppTaskStatus(task.task_name, "running", now, null, true);

      parseComicsDirectory()
        .then(() => {
          logger.info(`Background Task "${task.task_name}" completed successfully.`);
        })
        .catch((error) => {
          logger.error(`Background Task "${task.task_name}" encountered an error: ${error.message}`);
          const completedAt = new Date().toISOString();
          updateAppTaskStatus(task.task_name, "error", now, completedAt, false);
        })
        .finally(() => {
          logger.info(`Background Task "${task.task_name}" status updated to completed.`);
          const completedAt = new Date().toISOString();
          updateAppTaskStatus(task.task_name, "completed", now, completedAt, false);
          isRunning = false;
        });

    } catch (error) {
      logger.error(`Background Task "${task.task_name}" encountered an unexpected error: ${error}`);
      isRunning = false;
    }
  }, 5000);
}