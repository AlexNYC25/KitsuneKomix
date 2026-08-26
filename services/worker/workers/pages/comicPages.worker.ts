import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"
import { workerLogger } from "../../loggers";

export class ComicPagesWorker {
  queue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("PROCESS_COMIC_PAGES");
    }

    const job: QueueJob | null = this.queue.claimOne("process_comic_pages_worker");

    return job;
  }
    
  async start() {
    workerLogger.info("process comic pages worker has started")
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