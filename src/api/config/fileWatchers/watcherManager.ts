import chokidar from "chokidar";

import { getAllComicLibraries, getComicLibraryLastChangedTime } from "../../api/repositories/comicLibraries.repo.ts";
import { addNewComicFile } from "../../queue/actions/newComicFile.ts";

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
            .on("error", (error) => console.error(`Watcher error: ${error}`))
            .on("ready", () => console.log("Chokidar watcher is ready"));

        // Load existing libraries and watch their paths
        try {
            const libraries = getAllComicLibraries().filter(lib => lib.enabled);
            for (const lib of libraries) {
                console.log(`Adding path to watch: ${lib.path} (ID: ${lib.id})`);
                this.addPath(lib.path, lib.id);
            }
        } catch (error) {
            console.error("Error loading comic libraries:", error);
        }

        // Periodically refresh watched paths to catch any changes in the database
        setInterval(() => this.refreshWatchedPaths(), 1 * 60 * 1000); // every 1 minute


    }

    private async onFileAdded(path: string) {
        console.log(`File added: ${path}`);
        console.log(`Calling addNewComicFile with path: ${path}`);
        try {
            await addNewComicFile({ filePath: path, metadata: {} });
            console.log(`Successfully called addNewComicFile for: ${path}`);
        } catch (error) {
            console.error(`Error calling addNewComicFile for ${path}:`, error);
        }
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
