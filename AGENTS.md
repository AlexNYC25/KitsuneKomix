# KitsuneKomix Agent Guide

This guide outlines high-signal architectural and workflow constraints for working within KitsuneKomix.

## ⚙️ Environment & Setup
*   **Local Setup:** The entire ecosystem (API and Client) requires `docker-compose up --build` to start the necessary services.
*   **Tech Stack:** The project is a full-stack architecture:
    *   **API (Backend):** Deno, TypeScript, Hono, SQLite.
    *   **Client (Frontend):** Vue.js, TypeScript, Pinia.
    *   **Workers:** Background comic scanning/processing runs via a separate worker service using BullMQ and Redis.

## 🚀 Development Workflow (Client)
*   **API Type Generation:** When running the client's `dev` script, be aware that it *polls* the API's OpenAPI documentation endpoint (`http://localhost:8000/api/doc`) for up to 30 seconds to dynamically generate required API types before starting the development server. This API must be running for type generation to succeed.
*   **Execution:** Use `pnpm dev` for starting the client in development mode.

## 🛠️ Commands & Tooling
*   **Client Linting/Formatting:** Run `pnpm lint` and `pnpm format` to ensure code adheres to style guidelines (Airbnb/TypeScript best practices).
*   **Client Testing:** Use `pnpm test:unit` (Vitest) to run unit tests.

## 📜 Conventions
*   **Styling/Linting:** All code generally follows AirBnb JavaScript and TypeScript best practices.
*   **API Documentation:** API schemas are defined using Zod and exposed via OpenAPI for client consumption.