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

  async syncDirectories(nextDirectories: string []) {
    const next = new Set(nextDirectories);

    const toAdd = [...next].filter(dir => !this.watched.has(dir))

    const toRemove = [...next].filter(dir => !next.has(dir))

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