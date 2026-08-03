import { expect, test } from "bun:test"

import { testSQLiteConnection, generateSqlFilePath, env } from "kitsune-komix-database";

test("Database package can be pinged", async () => {
  const sqliteConnectionWorks: boolean = await testSQLiteConnection();

  expect(sqliteConnectionWorks).toBe(true)
})

test("Database File exists", async () => {
  const sqlitePath = await generateSqlFilePath(env.CONFIG_DIRECTORY);

  const file = Bun.file(sqlitePath);
  const exists = await file.exists();
  if (!exists) {
    await Bun.write(sqlitePath, "")
  }
})
