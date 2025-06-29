
import { getAppTaskQuery, updateAppTaskStatus } from "../database/queries/appTasks.ts";
import { parseComicsDirectory } from "../services/comicsParser.ts";

import logger from "../utilities/logger.ts";

export function startBackgroundComicsParser() {
  // This function will be called when the background task starts
  //console.log("Background task started");
  const taskName = "comic_parser";
  
  
  setInterval(() => {
    const task = getAppTaskQuery(taskName);
    if (!task) {
      console.error(`Task "${taskName}" not found in the database.`);
      return;
    }
    if (task.status == "running") {
      logger.warn("Background Task", `Task "${task.task_name}" is already running. Skipping this interval.`);
      return;
    }

    
    try {
      logger.info("Background Task", `Starting task "${task.task_name}" with interval ${task.interval} milliseconds`);
      
      const now = new Date().toISOString();
      updateAppTaskStatus(task.task_name, "running", now, null);

      parseComicsDirectory()
        .then(() => {
          logger.info("Background Task", `Task "${task.task_name}" completed successfully.`);
        })
        .catch((error) => {
          logger.error("Background Task", `Task "${task.task_name}" encountered an error: ${error.message}`);

          const completedAt = new Date().toISOString();
          updateAppTaskStatus(task.task_name, "error", now, completedAt);
        })
        .finally(() => {
          logger.info("Background Task", `Task "${task.task_name}" status updated to completed.`);

          const completedAt = new Date().toISOString();
          updateAppTaskStatus(task.task_name, "completed", now, completedAt);
        });
    } catch (error) {
      logger.error("Background Task", `Unexpected error in task "${task.task_name}": ${error}`);
    }
  }, 5000); // Run every 5 seconds
}