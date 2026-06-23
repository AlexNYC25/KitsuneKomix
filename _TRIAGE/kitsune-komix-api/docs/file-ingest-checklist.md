# File Ingest Checklist

This checklist follows the path a new comic file takes through the queue system.

## 1. File watcher sees a new file

- [ ] Ignore hidden paths.
- [ ] Enqueue `extract-metadata` on the file queue.

## 2. `extract-metadata` job runs

- [ ] Standardize metadata from the comic file.
- [ ] Store standardized metadata in Redis cache when available.
- [ ] Enqueue `process-comic-series` on the comic series queue.

## 3. `process-comic-series` job runs

- [ ] Read the parent folder of the comic file.
- [ ] Look up an existing comic series for that folder path.
- [ ] If a series exists, enqueue `save-comic-book` with the series ID.
- [ ] If no series exists, enqueue `add-new-comic-series`.

## 4. `add-new-comic-series` job runs

- [ ] Derive the series name from cached metadata or the folder name.
- [ ] Insert the comic series record.
- [ ] Enqueue `add-series-to-library`.
- [ ] Enqueue `save-comic-book` for the new series ID.

## 5. `add-series-to-library` job runs

- [ ] Find the library that contains the series folder path.
- [ ] Link the series to that library in the database.

## 6. `save-comic-book` job runs

- [ ] Hash the comic file and compare it to the stored record.
- [ ] Skip processing when the file hash has not changed.
- [ ] Combine filename parsing with cached metadata.
- [ ] Insert a new comic record or update the existing one.
- [ ] Link the comic book to its series.
- [ ] Enqueue `save-metadata`.
- [ ] Enqueue `process-comic-book-images`.

## 7. `save-metadata` job runs

- [ ] Load standardized metadata from Redis cache.
- [ ] Insert and link writers.
- [ ] Insert and link pencilers.
- [ ] Insert and link inkers.
- [ ] Insert and link colorists.
- [ ] Insert and link letterers.
- [ ] Insert and link editors.
- [ ] Insert and link cover artists.
- [ ] Insert and link publishers.
- [ ] Insert and link imprints.
- [ ] Insert and link genres.
- [ ] Insert and link characters.
- [ ] Insert and link teams.
- [ ] Insert and link locations.
- [ ] Insert and link story arcs.
- [ ] Remove the cached metadata after successful processing.

## 8. `process-comic-book-images` job runs

- [ ] Load cached metadata pages when available.
- [ ] Extract comic pages into a temporary directory.
- [ ] Insert a record for each comic page.
- [ ] Mark cover pages based on page order or metadata.
- [ ] Create cover records for cover pages.
- [ ] Generate thumbnails for cover images.
- [ ] Store thumbnail records in the database.
- [ ] Delete the extracted temporary folder.

## End-to-end summary

- [ ] File watcher -> `extract-metadata` -> `process-comic-series` -> `save-comic-book` -> `save-metadata` + `process-comic-book-images`
- [ ] Series creation path may branch through `add-new-comic-series` and `add-series-to-library` before `save-comic-book`