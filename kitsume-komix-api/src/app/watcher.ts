import chokidar, { type FSWatcher } from "chokidar";

import { apiLogger } from "#logger/loggers.ts";
import { getAllComicLibraries } from "#infrastructure/db/sqlite/models/comicLibraries.model.ts";
import { orchestrateFile } from "#modules/queue/orchestrators/comic.orchestrator.ts";

import { isHiddenPath } from "#utilities/file.ts";

const watcherOptions = {
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

/**
 * Builds and configures the chokidar FSWatcher instance for monitoring comic library paths.
 * The watcher is set up to handle file additions, changes, and deletions, with appropriate error handling and logging.
 * @returns A promise that resolves to the configured FSWatcher instance once it's ready and watching the appropriate paths.
 */
const createWatcher = (): FSWatcher => {
  const watcher = chokidar.watch([], watcherOptions);

  watcher
    .on("add", (path) => void handleTrackedFile(path, "add"))
    .on("change", (path) => void handleTrackedFile(path, "change"))
    .on("unlink", handleRemovedFile)
    .on("error", (error) => logWatcherError("Watcher error", error))
    .on("ready", () => apiLogger.info("Chokidar watcher is ready"));

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
 * Returns the current watcher instance if it exists, or an empty array if the watcher has not been started.
 * @returns 
 */
export const getWatcherInstances = (): FSWatcher[] => {
  return watcherInstance ? [watcherInstance] : [];
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

// TODO: Check if this can be moved to a utility file or be replaced with a more generic logger
const logWatcherError = (context: string, error: unknown) => {
  apiLogger.error(
    `${context}: ${error instanceof Error ? error.message : String(error)}`,
  );
};

// *** Event handlers *** 

/**
 * Handles added or changed files that are being tracked by the watcher. 
 * This includes orchestrating the processing of comic book files.
 * @param path The file path that triggered the event
 * @param action The type of event ("add" or "change") that occurred
 * @returns A promise that resolves when processing is complete
*/
const handleTrackedFile = async (path: string, action: "add" | "change") => {
  if (isHiddenPath(path)) {
    return;
  }

  try {
    await orchestrateFile(path);
  } catch (error) {
    logWatcherError(`Error handling ${action} event for ${path}`, error);
  }
};

/**
 * Handles removed files that are being tracked by the watcher.
 * This includes logging the removal and potentially flagging the file as missing in the database.
 * @param path The file path that was removed
 * @returns void
 */
const handleRemovedFile = (path: string) => {
  if (isHiddenPath(path)) {
    return;
  }

  apiLogger.info(`File removed: ${path}`);
  // TODO: Flag removed files as missing while retaining existing metadata.
};


// *** Watcher management functions ***

/**
 * Adds a new path to the watcher and associates it with a library ID.
 * @param path The file path to be watched
 * @param id The ID of the comic library associated with the path
 * @returns void
 */
const addPathToWatcher = (path: string, id: number) => {
  if (!watcherInstance) {
    return;
  }

  watchedLibraryIdsByPath.set(path, id);
  watcherInstance.add(path);
};

/**
 * Removes a path from the watcher and disassociates it from any library ID.
 * @param path The file path to stop watching
 * @returns void
 */
const removePathFromWatcher = (path: string) => {
  if (!watcherInstance) {
    return;
  }

  watchedLibraryIdsByPath.delete(path);
  watcherInstance.unwatch(path);
};

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
  } catch (error) {
    logWatcherError("Error refreshing watched paths", error);
  }
};




