import { apiLogger } from "../../logger/loggers.ts";
import { orchestrateFile } from "../../queue/orchestrators/comic.orchestrator.ts";

export async function addNewComicFile(
  params: { filePath: string; metadata: object },
) {
  try {
    apiLogger.info(`Adding new comic file job to queue: ${params.filePath}`);

    await orchestrateFile(params.filePath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    apiLogger.error(
      `Failed to add job to queue for file ${params.filePath}: ${errorMessage}`,
    );
    throw error;
  }
}
