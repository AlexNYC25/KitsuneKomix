import { assertEquals } from "@std/assert/equals";

import { testSQLiteConnection, generateSqlFilePath, env } from "kitsune-komix-database";

Deno.test("Database package can be pinged", async () => {
  const sqliteConnectionWorks: boolean = await testSQLiteConnection();

  assertEquals(sqliteConnectionWorks, true, "Something is wrong with the db connection set up and cannot be pinged with a select test")
})

Deno.test("Database File exists", async () => {
  const sqlitePath = await generateSqlFilePath(env.CONFIG_DIRECTORY);

  try {
    await Deno.lstat(sqlitePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await Deno.writeTextFile(sqlitePath, "")
    }
  }
}) 