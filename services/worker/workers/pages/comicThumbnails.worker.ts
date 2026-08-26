import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"
import { workerLogger } from "../../loggers";

export class ComicThumbnailsWorker {
  queue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("GENERATE_COMIC_THUMBNAILS");
    }

    const job: QueueJob | null = this.queue.claimOne("generate_comic_thumbnails_worker");

    return job;
  }
    
  async start() {
    workerLogger.info("comic thumbnails worker has started")
    while (true) {
      const job: QueueJob | null = await this.dequeue();

      if (!job) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        continue;
      }

      await this.processJob(job);
    }
  }

  async processJob(job: QueueJob) {
    workerLogger.info(job.payload)
    job.ack()
  }
}