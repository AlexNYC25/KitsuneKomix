import chokidar, { type FSWatcher, ChokidarOptions } from "chokidar";

import { workerLogger } from "#logger/loggers.ts";

const watcherOptions: ChokidarOptions = {
  persistent: true,
  ignoreInitial: false,
  depth: 99,
  awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 },
};

const refreshIntervalMs = 60_000;

let watcherInstance: FSWatcher | null = null;
let watcherStartupPromise: Promise<FSWatcher> | null = null;
let refreshIntervalId: ReturnType<typeof setInterval> | null = null;

const watchedLibraryIdsByPath = new Map<string, number>();

const createWatcher = (): FSWatcher => {
  const watcher = chokidar.watch([], watcherOptions);

  watcher
    .on("add", (path) => void handleTrackedFile(path, "add"))
    .on("change", (path) => void handleTrackedFile(path, "change"))
    .on("unlink", handleRemovedFile)
    .on("error", (error) => logWatcherError("Watcher error", error))
    .on("ready", () => workerLogger.info("Chokidar watcher is ready"));

  return watcher;
};

/**
 * The main entrypoint for starting the file watcher. 
 * This function ensures that only one instance of the watcher is created and that it is properly synchronized with the current comic library paths in the database.
 * @returns A promise that resolves to the FSWatcher instance once it is ready and watching the appropriate paths.
 */
export const startWatcher = (): Promise<FSWatcher> => {
  if (watcherInstance) {
    return Promise.resolve(watcherInstance);
  }

  if (watcherStartupPromise) {
    return watcherStartupPromise;
  }

  watcherStartupPromise = (async () => {
    const watcher = createWatcher();
    watcherInstance = watcher;

    try {
      await syncWatchedPaths();

      if (!refreshIntervalId) {
        refreshIntervalId = setInterval(() => {
          void syncWatchedPaths();
        }, refreshIntervalMs);
      }

      return watcher;
    } catch (error) {
      watcherInstance = null;
      await watcher.close();
      throw error;
    } finally {
      watcherStartupPromise = null;
    }
  })();

  return watcherStartupPromise;
};

/**
 * Deletes the current watcher instance and clears all associated paths and intervals.
 * This is used when the application is shutting down or when the watcher needs to be reset.
 * @returns A promise that resolves once the watcher has been stopped and all resources have been cleaned up.
 */
export const stopWatcher = async (): Promise<void> => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }

  watchedLibraryIdsByPath.clear();

  if (!watcherInstance) {
    return;
  }

  const watcher = watcherInstance;
  watcherInstance = null;
  await watcher.close();
};

const handleTrackedFile = async (path: string, eventType: "add" | "change") => {

};

const handleRemovedFile = async (path: string) => {
  
}

const logWatcherError = (message: string, error: unknown) => {
}

/**
 * Checks the current comic libraries in the database and synchronizes the watcher's paths accordingly.
 * This involves adding new paths for enabled libraries, updating existing paths if their IDs have changed, and removing paths that are no longer associated with any library.
 * @returns void
 */
const syncWatchedPaths = async () => {
  if (!watcherInstance) {
    return;
  }

  try {
    /*
    const libraries = await getAllComicLibraries();
    const enabledLibraries = libraries.filter((library) => library.enabled);
    const nextPaths = new Map(enabledLibraries.map((library) => [library.path, library.id]));

    for (const [path, id] of nextPaths.entries()) {
      if (!watchedLibraryIdsByPath.has(path)) {
        addPathToWatcher(path, id);
        continue;
      }

      watchedLibraryIdsByPath.set(path, id);
    }

    for (const watchedPath of [...watchedLibraryIdsByPath.keys()]) {
      if (!nextPaths.has(watchedPath)) {
        removePathFromWatcher(watchedPath);
      }
    }
    */
  } catch (error) {
    logWatcherError("Error refreshing watched paths", error);
  }
};