
# Important Files:

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