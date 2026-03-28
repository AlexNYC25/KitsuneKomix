
import { queueLogger } from "#logger/loggers.ts";

/**
 * Handles standard worker errors by logging them.
 * @param error 
 */
export const standardWorkerError = (error: Error) => {
  queueLogger.error(`Queue connection error: ${error}`);
}

/**
 * Logs the completion of a worker event.
 * @param param
 */
export const workerEventCompleted = ({jobId}: {jobId: string}) => {
  queueLogger.info(`Job ${jobId} has completed`);
}

/**
 * Logs the failure of a worker event.
 * @param param
 */
export const workerEventFailed = ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
	queueLogger.error(`Job ${jobId} has failed with reason: ${failedReason}`);
}