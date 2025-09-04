import { Worker, Queue } from "bullmq";
import { redisConnection } from "../../config/db/redisConnection.ts";
import { queueLogger } from "../../config/logger/loggers.ts";

function processNewComicFile(job: { data: { filePath: string; metadata: object } }): Promise<void> {
  return new Promise((resolve) => {
    queueLogger.info(`Processing new comic file: ${job.data.filePath}`);
    // Add your processing logic here
    resolve();
  });
}

export const comicFileWorker = new Worker(
	"appQueue",
		async (job) => {
		queueLogger.info(`Worker received job: ${job.name} with ID: ${job.id}`);
		switch (job.name) {
			case "newComicFile":
				await processNewComicFile(job);
				break;
			default:
				queueLogger.warn(`Unknown job type: ${job.name}`);
		}
	},
	{ connection: redisConnection }
);

comicFileWorker.on("ready", () => {
	console.log("Comic file worker is ready and connected to Redis");
	queueLogger.info("Comic file worker is ready");
});

comicFileWorker.on("completed", (job) => {
	queueLogger.info(`Worker Job ${job.id} has completed`);
});

comicFileWorker.on("failed", (job, err) => {
	queueLogger.error(`Worker Job ${job?.id} has failed with error: ${err.message}`);
});

comicFileWorker.on("error", (err) => {
	queueLogger.error(`Worker error: ${err.message}`);
});