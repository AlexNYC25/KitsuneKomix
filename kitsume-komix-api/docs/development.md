# Development

## Overview of the Api directory structure

Comprised of a Deno runtime that when started, initializes both the REST API service and the background worker service.

At the start of the application, the main entry point `main.ts` under the `kitsune-komix-api/` directory initializes both services:

```plaintext
kitsume-komix-api/
├── api/
│   ├── middlewares/           # Middleware functions for request processing
│   ├── routes/                # API route definitions
│   ├── services/              # Service layer for business logic
│   ├── app.ts                 # Main setup for the Hono application including importing routes setting up middlewares
├── fileWatchers/              # File watcher implementations for scanning comic books
│   ├── watcherManager.ts      # Manages what actions are taken when files change/modify/delete etc using chokidar; defines the WatchManager object called in main.ts
├── queue/                     # Background worker implementations
│   ├── actions/               # Defines functions for adding jobs to the queue
│   │   ├── newComicFile.ts    # Middleman that adds a 'new comic book' job to the queue when a new comic file is detected
│   ├── workers/               # Defines the workers that process jobs for each queue
│   │   ├── comicWorker.ts     # Worker that processes jobs in the 'comic processing' queue; extracts metadata from comic book files and updates the database
│   ├── queueManager.ts        # Defines the actual queue using BullMQ; including event handlers for job completion/failure etc
├── main.ts                    # Main entry point that starts both the REST API and background worker services
```

### Services under the Api directory

#### REST API Service
- Responsible for handling HTTP requests from the KitsuneKomix Client.
- Provides endpoints for managing comic books, series, creators, and user authentication.

Built mainly with Hono framework for Deno, utilizing Zod for schema validation and Zod-Openapi for generating OpenAPI documentation.

#### Background Worker Service
- Responsible for scanning directories for new comic books.
- Processes and extracts metadata from comic book files.
- Updates the database with new comic book information.

For this service, BullMQ is used for job queue management, with Redis as the in-memory database to handle job states and processing,
with the Redis server running in a separate Docker container alongside the Deno runtime container.

![App Architecture](./diagrams/app-service.svg)
