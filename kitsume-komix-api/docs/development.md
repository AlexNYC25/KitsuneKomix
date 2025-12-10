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

### API Routes
API routes are defined under the `api/routes/` directory, organized by resource type (e.g., comics, series, creators, auth) and route category. 
Each route file defines the endpoints and their corresponding handlers.

For example we have the `api/routes/api.router.ts` file that imports and combines all the individual route files related
to providing the REST API into a single router that is then used in the main application setup.

But for each resource type, we have separate route files like:
- `api/routes/api.comicbooks.router.ts` for comic book related endpoints.
- `api/routes/api.comicseries.router.ts` for series related endpoints.

The notable exception being when we don't have many endpoints for a resource type, like with the OpenAPI documentation and Swagger UI route those 
are both defined in the aggragate `api/routes/api.router.ts` file directly.

- Each sub route should use the OpenAPI Hono router to define the endpoints, request/response schemas, and any necessary middleware.
- Each route endpoint should have it's request and response schemas defined using Zod, and documented using Zod-Openapi decorators.
- As a generally rule of thumb each request/response schema should be defined in the `zod/schemas` directory and imported into the route file for use.
- We should also try to keep the route handlers as thin as possible, delegating business logic to service layer functions defined in the `api/services/` directory, but logic invloving
pagination, filtering, sorting, parsing request parameters etc can be handled in the route handler itself before calling the service layer functions.
- The end data returned from the routes should be in camelCase format to be consistent with JavaScript/TypeScript conventions.

### Database (SQLite) workflow

We use SQLite as the database for KitsuneKomix API, for easy local data storage that doesn't require a separate database server.

For the actual connector to the database, we use the libsql library to connect to the SQLite database file and execute queries, then we pass the 
connection to the libsql prisma client to allow Prisma to interact with the database.

Note the connection to the SQLite database connection is initialized and shared globally in the `kitsume-komix-api/db/sqlite/client.ts` file.

Prisma is used as the ORM to interact with the SQLite database, providing type-safe database queries and schema migrations.

The primary config file is located at `kitsume-komix-api/drizzle.config.ts`, which defines the location of the SQLite database file and other Prisma settings.

With the actual schema defined in the `kitsume-komix-api/db/sqlite/schema.ts` file using Drizzle ORM's schema definition syntax.

To make changes to the database schema, we need to update the schema file and then run the migration command to generate the migration files that will
be located in the `kitsume-komix-api/drizzle/` directory. On the following start up of the application, Prisma will automatically apply any pending migrations to the database.

```bash
    deno run db:generate
```

#### Documenting the Database Schema
The database schema is documented using the `kitsume-komix-api/docs/dbml` file, which provides an overview of the tables, columns, and relationships in the database, using 
DBML (Database Markup Language) syntax.

On every change to the database schema, the DBML file should be updated to reflect the changes made.

#### Organizing queries
To keep database queries organized and maintainable, we define query functions in separate files under the `kitsume-komix-api/db/sqlite/models/` directory.
Where for every table in the database, we have a corresponding model file that defines functions for common queries related to that table.

For example, we have:
- `kitsume-komix-api/db/sqlite/models/comicBooks.model.ts` for queries related to the `comicBooks` table.
- `kitsume-komix-api/db/sqlite/models/comicSeries.model.ts` for queries related to the `comicSeries` table.
- `kitsume-komix-api/db/sqlite/models/comicColorists.model.ts` for queries related to the `comicColorists` table.

Each model file exports functions for creating, reading, updating, and deleting records in the corresponding table, as well as any complex queries needed for that resource.
In general if we have complex queries that span multiple tables or involve joins, we should define that query in the model file for the primary table being queried.

For example if we have a query that fetches comic books along with their series and creators, that query should be defined in the `comicBooks.model.ts` model file.