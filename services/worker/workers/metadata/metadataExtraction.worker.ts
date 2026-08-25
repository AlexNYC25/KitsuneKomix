import {
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database";

export class MetadataWorker {
  queue: null | QueueType = null;

  async dequeue() {

  }

  async start() {
    console.log("metadata worker has started")

    while (true) {
      const job: QueueJob | null = null;

      if (!job) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        continue;
      }

      await this.processJob(job);

    }
  }

  async processJob(job: QueueType) {

  }
}