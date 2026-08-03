import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"

export class MetadataInsertionWorker {
  queue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("COMICINFO_METADATA_CREATION");
    }

    const job: QueueJob | null = this.queue.claimOne("comicinfo_metadata_creation_worker");

    return job;
  }
    
  async start() {
    console.log("comicinfo metadata creation worker has started")
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