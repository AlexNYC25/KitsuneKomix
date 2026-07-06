import chokidar from "chokidar"

import { 
  getIngestionDiscoveryQueue,
  getFileModifiedQueue,
  getFileRemovedQueue,
  type QueueType
} from "kitsune-komix-database"

export class WatchManager {
  private watcher = chokidar.watch([], {
    persistent:true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100
    }
  });

  private discoveryQueue: null | QueueType = null;
  private fileModifiedQueue: null | QueueType = null;
  private fileRemovedQueue: null | QueueType = null;

  private watched = new Set<string>();

  constructor() {
    this.watcher.on("add", this.onFileAdded)
    this.watcher.on("change", this.onFileChanged)
    this.watcher.on("unlink", this.onFileRemoved)
  }

  private onFileAdded = async (path: string) => {
    console.log("new file", path)
    
    if (!this.discoveryQueue) {
      this.discoveryQueue = await getIngestionDiscoveryQueue();
    }

    this.discoveryQueue.enqueue({ path })
  }

  private onFileChanged = async (path: string) => {
    console.log("file changed", path)

    if (!this.fileModifiedQueue) {
      this.fileModifiedQueue = await getFileModifiedQueue();
    }

    this.fileModifiedQueue.enqueue({ path })
  }

  private onFileRemoved = async (path: string) => {
    console.log("removed", path)

    if (!this.fileRemovedQueue) {
      this.fileRemovedQueue = await getFileRemovedQueue();
    }

    this.fileRemovedQueue.enqueue({ path })
  }

  async syncDirectories(nextDirectories: string []) {
    const next: Set<string> = new Set(nextDirectories);

    const toAdd: string[] = [...next].filter(dir => !this.watched.has(dir))

    const toRemove: string[] = [...next].filter(dir => !next.has(dir))

    if (toAdd.length) {
      this.watcher.add(toAdd)

      toAdd.forEach(d => this.watched.add(d))
    }

    if (toRemove.length) {
      this.watcher.unwatch(toRemove)

      toRemove.forEach(d => this.watched.delete(d))
    }
  }

  async close() {
    await this.watcher.close();
  }
}