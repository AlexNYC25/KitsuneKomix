import { 
  getQueue,
  type QueueJob, 
  type QueueType 
} from "kitsune-komix-database"

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
    console.log("process comic pages worker has started")
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