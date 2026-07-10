import { 
  getIngestionDiscoveryQueue, 
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"

export class IngestionWorker {
  queue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getIngestionDiscoveryQueue();
    }

    const job: QueueJob | null = this.queue.claimOne("ingestion_worker");

    return job;
  }
    
  async start() {
    console.log("ingestion worker has started")
    while (true) {
      const job: QueueJob | null = await this.dequeue();

      if (!job) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        continue;
      }

      await this.processJob(job);
    }
  }

  async processJob(job: any) {

  }
}