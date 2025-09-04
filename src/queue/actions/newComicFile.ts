import { appQueue } from "../queueManager.ts";
import { apiLogger } from "../../config/logger/loggers.ts";

export async function addNewComicFile(params: { filePath: string; metadata: object }) {
  apiLogger.info(`Adding new comic file job to queue: ${params.filePath}`);
  
	const job = await appQueue.add("newComicFile", params);
	
	return job;
}