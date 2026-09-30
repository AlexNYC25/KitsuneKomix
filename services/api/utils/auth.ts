import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { getClient } from "kitsune-komix-database";

const db = await getClient();

export const auth = betterAuth({
  database: drizzleAdapter(db, { 
    provider: "sqlite", // or "pg" or "mysql"
  }), 
  //... the rest of your config
});