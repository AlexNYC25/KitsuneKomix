import chokidar from "chokidar"

export class WatchManager {
  private watcher = chokidar.watch([], {
    persistent:true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100
    }
  });

  private watched = new Set<string>();

  constructor() {
    this.watcher.on("add", this.onFileAdded)
    this.watcher.on("change", this.onFileChanged)
    this.watcher.on("unlink", this.onFileRemoved)
  }

  private onFileAdded = (path: string) => {
    console.log("new file", path)
  }

  private onFileChanged = (path: string) => {
    console.log("file changed", path)
  }

  private onFileRemoved = (path: string) => {
    console.log("removed", path)
  }

  async close() {
    await this.watcher.close();
  }
}