import chokidar from "chokidar";

import { apiLogger } from "#infrastructure/logger/loggers.ts";
import {
  getAllComicLibraries,
  getComicLibraryLastChangedTime,
} from "#infrastructure/db/sqlite/models/comicLibraries.model.ts";
import { orchestrateFile } from "#modules/queue/orchestrators/comic.orchestrator.ts";


let instance: WatchManager | null = null;

/**
 * Point of access for the WatchManager singleton instance. Ensures that only one instance of WatchManager exists throughout the application.
 * @returns The singleton instance of WatchManager.
 */
export function getWatcherManager(): WatchManager {
  if (!instance) {
    instance = new WatchManager();
  }
  return instance;
}

/**
 * The actual WatchManager class that encapsulates the logic for watching file system changes in comic library paths. 
 * It uses chokidar to monitor directories and react to file additions, changes, and deletions. 
 * The manager also periodically refreshes the list of watched paths based on the current state of the comic libraries in the database.
 */
export class WatchManager {
  // Defines the chokidar watcher with the specified options.
  private watcher = chokidar.watch([], {
    persistent: true,
    ignoreInitial: false,
    depth: 99,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 },
  });

  // Map will represent file paths and their ids
  private byPath = new Map<string, number>();

  constructor() {
    // As part of the constructor we set up the event listeners for the chokidar watcher
    this.watcher
      .on("add", (path) => this.onFileAdded(path))
      .on("change", (path) => this.onFileChanged(path))
      .on("unlink", (path) => this.onFileRemoved(path))
      .on(
        "error",
        (error) =>
          apiLogger.error(
            `Watcher error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
      )
      .on("ready", () => apiLogger.info("Chokidar watcher is ready"));

    // Load the library paths from the database and start watching them
    this.initializeWatchedPaths();

    // Periodically refresh watched paths to catch any changes in the database
    setInterval(() => this.refreshWatchedPaths(), 1 * 60 * 1000); // every 1 minute
  }

  // Helper methods to add/remove paths from the watcher and the internal map

  private addPath(path: string, id: number) {
    this.byPath.set(path, id);
    this.watcher.add(path);
  }

  private removePath(path: string) {
    this.watcher.unwatch(path);
    this.byPath.delete(path);
  }

  /**
   * Pulls the list of comic libraries from the database and adds their paths to the watcher if they are enabled.
   */
  private async initializeWatchedPaths() {
    try {
      const libraries = await getAllComicLibraries();
      for (const lib of libraries) {
        if (lib.enabled) {
          this.addPath(lib.path, lib.id);
        }
      }
    } catch (error) {
      apiLogger.error(
        `Error loading comic libraries: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Refreshes the list of watched paths by comparing the current state of the comic libraries in the database with the paths currently being watched.
   */
  private async refreshWatchedPaths() {
    try {
      const libraries = await getAllComicLibraries();
      const enabledLibraries = libraries.filter((lib) => lib.enabled);
      const currentPaths = new Set(this.byPath.keys());

      for (const lib of enabledLibraries) {
        if (!this.byPath.has(lib.path)) {
          // New library path to watch
          this.addPath(lib.path, lib.id);
        } else {
          // Check if the library has changed
          const lastChanged = await getComicLibraryLastChangedTime(lib.id);
          const lastWatched = this.byPath.get(lib.path);
          if (
            lastChanged && lastWatched &&
            new Date(lastChanged).getTime() > lastWatched
          ) {
            // Update the timestamp
            this.byPath.set(lib.path, new Date(lastChanged).getTime());
          }
        }
        currentPaths.delete(lib.path);
      }

      // Remove paths that are no longer in the libraries
      for (const obsoletePath of currentPaths) {
        this.removePath(obsoletePath);
      }
    } catch (error) {
      apiLogger.error(
        `Error refreshing watched paths: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  // The event handlers for chokidar events

  private async onFileAdded(path: string) {
    // skip . files and hidden files
    if (path.startsWith(".") || path.includes("/.")) {
      return;
    }
    try {
      await orchestrateFile(path);
    } catch (error) {
      apiLogger.error(
        `Error calling orchestrateFile for ${path}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private onFileRemoved(path: string) {
    console.log(`File removed: ${path}`);
    // TODO: Implement handling for file removals if needed
    // Ideally it should be flagged as "missing" in the database and the data for the comic should be retained
  }

  private onFileChanged(path: string) {
    console.log(`File changed: ${path}`);
    // TODO: Implement handling for file changes if needed
  }

  /*
  TODO: Check if this is needed might be deprecated
  getChangedFiles(since: number): string[] {
    const changedFiles: string[] = [];
    for (const [path, timestamp] of this.byPath.entries()) {
      if (timestamp > since) {
        changedFiles.push(path);
      }
    }
    return changedFiles;
  }
  */

  close() {
    this.watcher.close();
  }
}
