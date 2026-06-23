# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New Dockerfile, now a single file for both prod and dev enviorments
- Updated docker compose file to take in values from .env file
- Sqlite and Redis db connections
- Pino logger to output to files
- Added drizzle for orm managment
- Added zod for type validation
- database.dbml file for easy visualization of tables and relationships between
  them
- drizzle migrations folder for schema changes and migrations
- Added initial vue template to the project to server as the front end client
- updated routing to server up the production version of the vue site
- Sharp packages for image manipulation

### Changed

- Migrated current code to archive location for deletion, in process of rewrite
- deno.json has updated packages including zod, bullmq, pino
- Updated models to return data using types generated from drizzle models
- Migrated to using a chokidar + bullmq setup to process files as they are
  mounted to the app volumes
- Changed api framework from oak to hono
- Updated app types to export from a single import, collecting all other types

### Removed

- Removed logosaurus

## [0.0.2] - 2025-06-07

### Added

- Changelog file based on
  [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- Dockerfile for building the typescript/api project and serving it
- Created package.json for project, installing typescript, vitest, nodemon,
  express ( + typescript types)
- Created tsconfig.json to use modules with this project and declare project
  root, output location
- Created vitest.config.ts to declare tests location and basic properties to use
  vitest for testin
- Created basic index.ts file serving simple "Hello, world!" to test
  configuration/enviorment

## [0.0.1] - 2025-06-07

### Added

- MIT license
- Basic github generated readme

[unreleased]: https://github.com/AlexNYC25/KitsuneKomix/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/AlexNYC25/KitsuneKomix/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/AlexNYC25/KitsuneKomix/releases/tag/v0.0.1
