
import { getAllComicLibraries, type ComicLibrary } from "kitsune-komix-database"

import { env } from "./config/env";
import { WatchManager } from "./watcher/manager";

const workerWatcher = new WatchManager();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

while (true) {
  const libraries: ComicLibrary[] = await getAllComicLibraries();
  const paths: string[] = libraries.map(l => l.path);

  await workerWatcher.syncDirectories(paths);
  
  await sleep(env.LIBRARY_SCAN_INTERVAL);
}
