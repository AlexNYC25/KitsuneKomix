# worker

The Worker uses the Honker sqlite extension so the app's sqlite file acts as a queue for tracking individual jobs with the initiator being kicked off when 
the chokidar library notices new files in one of the defined library directories

## Initial File Discovery

### IngestionWorker

╔═════════════════╤══════════════════╤═════════════════════╗
║ Worker          │ Payload Type     │ Queue               ║
╠═════════════════╪══════════════════╪═════════════════════╣
║ IngestionWorker │ IngestionPayload │ INGESTION_DISCOVERY ║
╚═════════════════╧══════════════════╧═════════════════════╝

On the discovery of a new file the IngestionWorker starts with the initial payload from the chokidar background process

╔══════════════════╤════════╤══════════════════════════════╗
║ Payload Property │ Type   │ Notes                        ║
╠══════════════════╪════════╪══════════════════════════════╣
║ filePath         │ string │ The location of the new file ║
╚══════════════════╧════════╧══════════════════════════════╝

In the worker's process job logic:

- Sanity check the file still exists
- Finds what user defined library the comic book file belongs to
- Prepares the next job's payload
- Adds it to the BOOK_RECORD queue
- Finishes the worker's job

### ComicBookRecordWorker

╔═══════════════════════╤═══════════════════════════════════╤═════════════╗
║ Worker                │ Payload Type                      │ Queue       ║
╠═══════════════════════╪═══════════════════════════════════╪═════════════╣
║ ComicBookRecordWorker │ IngestionToComicBookRecordPayload │ BOOK_RECORD ║
╚═══════════════════════╧═══════════════════════════════════╧═════════════╝

When the previous worker preforms their job as part of it's own job logic it adds a new job to the BOOK_RECORD queue

╔══════════════════╤═════════╤═════════════════════════════════════════════════════╗
║ Payload Property │ Type    │ Notes                                               ║
╠══════════════════╪═════════╪═════════════════════════════════════════════════════╣
║ filePath         │ string  │ The location of the new file                        ║
╟──────────────────┼─────────┼─────────────────────────────────────────────────────╢
║ libraryId        │ integer │ The id for the user defined library in the database ║
╚══════════════════╧═════════╧═════════════════════════════════════════════════════╝

In the worker's process job logic:

- Parses the surface level info of the comic book by parsing the file name
- Generates a manifest for every entry in the archive
- Takes the parsed and manifest info and combines it into a NewComicBook type object
- Inserts the NewComicBook record into the database, records the id
- Create the next workers/job payload type, adds it to the BOOK_SERIES_MAPPING queue
- Finishes the job

### ComicBookSeriesMappingWorker (In Progress)

Notes:

- Find the series record in the db where the comic file will belong to (create it if needed)
- Create the mapping record for the comics to comic series
- Optionally if we have a metadata file as part of the archive then we add a job to the appropriate queue to process the metadata
- Create the job data to generate the comic books thumbnail data
- Add the new job data payload the the next queue
