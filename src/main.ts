import app from "./api/app.ts";
import { initializeDatabase } from "./config/db/sqliteSetUp.ts";
import "./config/fileWatchers/libraryWatchers.ts";

initializeDatabase();

const port = parseInt(Deno.env.get("PORT") ?? "3000", 10);

Deno.serve({ port: port }, app.fetch);
