
# Important Files:
## watcherManager.ts
This file contains the logic for routinely checking the comic directory for changes like new comics being added,
comics being removed, or comics being modified. It uses the `chokidar` library to watch for file system changes and triggers appropriate actions when changes are detected.

## actions/newComicFile.ts
This is the file that contains the functions `addNewComicFile` that calls for the redis/bullmq queue 
and then adds the the new comics file to the queue for processing

## queueManager.ts
This file defines the bullmq queue with the Queue class, as well as connecting the app queue created
with the redis connection. 

## workers/comicWorker.ts
Here we define the worker for the bullmq queue charged with handing/processing comic related jobs.
Specifically laying out what jobs this worker will process based on the job name, and when needed
adds other jobs to the queue for processing.

This is where the main logic for processing and orchestrating the processing of new comic files is located. 

It defines the main function `processComicFile` that is called when a new comic file job(`newComicFile`) is added to the queue, 
and then calls other helper functions to handle specific tasks like extracting metadata, inserting data into the database, etc.