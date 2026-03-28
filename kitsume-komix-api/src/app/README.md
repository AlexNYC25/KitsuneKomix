# Apps

## api.ts
The main entry point for the API Server, which sets up the Hono app, pulling the modular routes
and returning a single app instance.

## worker.ts
The main entry point for the Worker, which sets up the BullMQ queues and their event listeners

## watcher.ts
The main entry point for the Watcher, which sets up the Chokidar file watcher and synchronizes it with the comic libraries in the database.