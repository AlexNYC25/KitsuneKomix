import chokidar from "chokidar";

import { getAllComicLibraries, getComicLibraryLastChangedTime } from "../../api/repositories/comicLibraries.repo.ts";

let instance: WatchManager | null = null;

export function getWatcherManager(): WatchManager {
    if (!instance) {
        instance = new WatchManager();
    }
    return instance;
}

export class WatchManager {
    private watcher = chokidar.watch([], {
        persistent: true,
        ignoreInitial: false,
        depth: 99,
    });

    // Map will represent file paths and their ids
    private byPath = new Map<string, number>();

    constructor() {
        this.watcher
            .on("add", (path) => this.onFileAdded(path))
            .on("change", (path) => this.onFileChanged(path))
            .on("unlink", (path) => this.onFileRemoved(path))
            .on("error", (error) => console.error(`Watcher error: ${error}`));

        // Load existing libraries and watch their paths
        const libraries = getAllComicLibraries().filter(lib => lib.enabled);
        for (const lib of libraries) {
            this.addPath(lib.path, lib.id);
        }

        // Periodically refresh watched paths to catch any changes in the database
        setInterval(() => this.refreshWatchedPaths(), 1 * 60 * 1000); // every 1 minute


    }

    private onFileAdded(path: string) {
        console.log(`File added: ${path}`);
    }

    private onFileRemoved(path: string) {
        console.log(`File removed: ${path}`);
    }

    private onFileChanged(path: string) {
        console.log(`File changed: ${path}`);
    }

    private refreshWatchedPaths() {
        const libraries = getAllComicLibraries().filter(lib => lib.enabled);
        const currentPaths = new Set(this.byPath.keys());

        console.log(libraries);

        for (const lib of libraries) {
            if (!this.byPath.has(lib.path)) {
                // New library path to watch
                this.addPath(lib.path, lib.id);
            } else {
                // Check if the library has changed
                const lastChanged = getComicLibraryLastChangedTime(lib.id);
                const lastWatched = this.byPath.get(lib.path);
                if (lastChanged && lastWatched && new Date(lastChanged).getTime() > lastWatched) {
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
    }

    addPath(path: string, id: number) {
        this.byPath.set(path, id);
        this.watcher.add(path);
    }

    removePath(path: string) {
        this.watcher.unwatch(path);
        this.byPath.delete(path);
    }

    getChangedFiles(since: number): string[] {
        const changedFiles: string[] = [];
        for (const [path, timestamp] of this.byPath.entries()) {
            if (timestamp > since) {
                changedFiles.push(path);
            }
        }
        return changedFiles;
    }

    close() {
        this.watcher.close();
    }
}
