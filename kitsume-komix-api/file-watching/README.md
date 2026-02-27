# File Watching Module

This is the module responsible for watching the comic directory for changes, such as new comics being added, comics being removed, or comics being modified. 
It uses the `chokidar` library to watch for file system changes and triggers appropriate actions when changes are detected.

## Important Files:
### watcherManager.ts
This file contains the logic for routinely checking the comic directory for changes like new comics being added,
comics being removed, or comics being modified. It uses the `chokidar` library to watch for file system changes and triggers appropriate actions when changes are detected.

### actions/newComicFile.ts
This is the file that contains the functions `addNewComicFile` that calls for the redis/bullmq queue 
and then adds the the new comics file to the queue for processing