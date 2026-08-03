import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"

export class MetadataAggregationWorker {
  queue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("COMIC_METADATA_AGGREGATION");
    }

    const job: QueueJob | null = this.queue.claimOne("comic_metadata_aggregation_worker");

    return job;
  }
    
  async start() {
    console.log("comic metadata aggregation worker has started")
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