import { assertEquals } from "@std/assert/equals";

import { testSQLiteConnection } from "kitsune-komix-database";

Deno.test("Database package can be pinged", async () => {
  const sqliteConnectionWorks: boolean = await testSQLiteConnection();

  assertEquals(sqliteConnectionWorks, true, "Something is wrong with the db connection set up and cannot be pinged with a select test")
})