import { fileQueue } from "../../app/worker.ts";

/**
 * Starts the comic processing workflow by enqueueing the first job.
 *
 * @param filePath Path to the new comic file detected by file watcher
 */
export async function orchestrateFile(filePath: string) {
  await fileQueue.add("extract-metadata", { filePath });
}