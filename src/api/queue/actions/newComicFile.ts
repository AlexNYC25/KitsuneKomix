import { appQueue } from "../queueManager.ts";
import { apiLogger } from "../../config/logger/loggers.ts";

export async function addNewComicFile(
  params: { filePath: string; metadata: object },
) {
  try {
    apiLogger.info(`Adding new comic file job to queue: ${params.filePath}`);

    const job = await appQueue.add("newComicFile", params);

    apiLogger.info(`Job successfully added to queue with ID: ${job.id}`);
    return job;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    apiLogger.error(
      `Failed to add job to queue for file ${params.filePath}: ${errorMessage}`,
    );
    throw error;
  }
}
