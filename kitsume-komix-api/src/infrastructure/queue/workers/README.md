
## Workflow for processing a comic file when added to the queue by the comicWorker:
1.  We check the file and its path against the database to see if it already exists. 
1.a If it does, we further check if the file has been modified since it was last processed. 
1.b If it has not been modified, we skip processing this file and move on to the next one in the queue.

2. We determine the comic library it belongs to based on its file path and the library paths we have in the database. 
2.a If it does not belong to any library, we skip processing this file.
