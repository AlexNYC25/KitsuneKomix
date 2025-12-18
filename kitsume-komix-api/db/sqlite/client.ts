import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { join } from "@std/path";

const DB_PATH = join(Deno.cwd(), "config", "database.sqlite");

let client: ReturnType<typeof createClient> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export const getClient = () => {
  if (!client) {
    client = createClient({ url: `file:${DB_PATH}`});
    db = drizzle(client, { casing: "snake_case" });
  }
  return { client, db };
};

export const createNewClient = () => {
  const newClient = createClient({ url: `file:${DB_PATH}` });
  const newDb = drizzle(newClient, { casing: "snake_case" });
  return { client: newClient, db: newDb };
};
