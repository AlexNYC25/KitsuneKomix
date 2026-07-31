import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"

export class ComicBookSeriesMappingWorker {
  queue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("BOOK_SERIES_MAPPING");
    }

    const job: QueueJob | null = this.queue.claimOne("book_series_mapping_worker");

    return job;
  }
    
  async start() {
    console.log("comic book to series mapping worker has started")
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
    console.log(job.payload)
    job.ack()
  }
}