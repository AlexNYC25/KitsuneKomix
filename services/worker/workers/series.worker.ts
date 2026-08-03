import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"

export class SeriesWorker {
  queue: null | QueueType = null;

  async dequeue() {
    if (!this.queue) {
      this.queue = await getQueue("SERIES_DISCOVERY");
    }

    const job: QueueJob | null = this.queue.claimOne("series_worker");

    return job;
  }

  async start() {
    console.log("series worker has started")
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