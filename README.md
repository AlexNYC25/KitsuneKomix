# KitsuneKomix

## Overview

KitsuneKomix is a digital comic book reader and management application designed to ultimately provide users with
a seamless experience for reading their digital comic book collections.

The project consists of two main components:
1. **KitsuneKomix API**: A backend RESTful API built with Deno and TypeScript, responsible for managing comic book data,
   user authentication, and serving comic book files.

2. **KitsuneKomix Client**: A frontend application built with Vue.js and TypeScript, providing an intuitive user interface
   for browsing, reading, and managing comic books.

## Features
- User authentication and management
- Rolling scanning for new comic books
- Comic book metadata comprehension and display for the most popular formats: ComicInfo, Metron
- Responsive and user-friendly interface for reading comic books

## Installation

### Instructions for setting up the KitsuneKomix API and Client locally.

#### Prerequisites
- [Docker](https://www.docker.com/get-started) installed on your machine

#### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/AlexNYC25/KitsuneKomix.git
   cd KitsuneKomix
   ```
2. Run the docker-compose to set up the development environment:
   ```bash
   docker-compose up --build
   ```

### Instructions for setting up the KitsuneKomix API and Client in production.
Work in progress...

## Usage
- Access the KitsuneKomix Client at `http://localhost:5173`
- Access the KitsuneKomix API at `http://localhost:8000`
- Access the OpenAPI documentation with Swagger UI at `http://localhost:8000/api/ui`


## Development

### Repository Structure
- `kitsume-komix-api/`: Contains the source code for the KitsuneKomix API and the background worker responsible for scanning and processing comic books.
- `kitsume-komix-client/`: Contains the source code for the KitsuneKomix Client.

### Major Technologies Used

#### KitsuneKomix API
- [Deno](https://deno.land/): A secure runtime for JavaScript and TypeScript.
- [Zod](https://zod.dev/): A TypeScript-first schema declaration and validation library.
- [Hono](https://hono.dev/): A small, simple, and fast web framework for Deno and Node.js.
- [Zod-Openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi): A extended Hono library for OpenAPI documentation generation using Zod schemas.
- [SQLite](https://www.sqlite.org/index.html): A lightweight, disk-based database, used to store comic book metadata and user information.
- [Pino](https://getpino.io/#/): A fast and low-overhead logging library for logging API activities and errors.

#### KitsuneKomix API worker
- [BullMQ](https://docs.bullmq.io/): A Node.js library for handling distributed jobs and messages in Node.js applications, used for background processing of comic book scanning and metadata extraction.
- [Redis](https://redis.io/): An in-memory data structure store, used as the main memory database for BullMQ.
- [Chokidar](https://github.com/paulmillr/chokidar): A Node.js library for watching file system changes, used for monitoring comic book directories for new or updated files.

#### KitsuneKomix Client
- [Vue.js](https://vuejs.org/): A progressive JavaScript framework for building user interfaces.
- [Pinia](https://pinia.vuejs.org/): A state management library for Vue.js applications.
- [PrimeVue](https://www.primefaces.org/primevue/): A rich set of open-source UI components for Vue.js.
- [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapid UI development.

### Contributing

For both the KitsuneKomix API and Client we generally follow the AirBnb JavaScript style guide, with additional
rules for Typescript. Please ensure that your code adheres to these guidelines before submitting a pull request.
[AirBnb JavaScript Style Guide](https://github.com/airbnb/javascript)
[Typescripts best Practices](https://github.com/andredesousa/typescript-best-practices)

### Documentation

Comprehensive documentation for both the KitsuneKomix API and Client can be found in the `docs/` directory of each
component. This includes specific setup guides, reference materials, and development guidelines.

#### KitsuneKomix API Documentation
- [Development Guide](./kitsume-komix-api/docs/development.md)

#### KitsuneKomix Client Documentation
- [Development Guide](./kitsume-komix-client/docs/development.md)

