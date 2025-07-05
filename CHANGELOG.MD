# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Basic parse functions to parse comic book series/issue metadata from the folder/file name
- Added vitest suites to test fileNames.ts and folderNames.ts functionailty with potential real world examples
- Regex strings for common comic file/folder parsing
- Deno config files
- Dockerfiles for Deno for both production and development
- Created database setup for connecting/creating to a sqlite file, running queries for initial setup
- Added default logger setup

### Changed 
- Changed js runtime from node to deno
- Migrated index.ts/Express.js to main.ts/Oak

### Removed
- tsconfig.json: typescript is supported natively for Deno

## [0.0.2] - 2025-06-07

### Added

- Changelog file based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- Dockerfile for building the typescript/api project and serving it
- Created package.json for project, installing typescript, vitest, nodemon, express ( + typescript types)
- Created tsconfig.json to use modules with this project and declare project root, output location
- Created vitest.config.ts to declare tests location and basic properties to use vitest for testin
- Created basic index.ts file serving simple "Hello, world!" to test configuration/enviorment

## [0.0.1] - 2025-06-07

### Added

- MIT license
- Basic github generated readme


[unreleased]: https://github.com/AlexNYC25/KitsuneKomix/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/AlexNYC25/KitsuneKomix/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/AlexNYC25/KitsuneKomix/releases/tag/v0.0.1