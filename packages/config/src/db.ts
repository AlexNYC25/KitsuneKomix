import { dbSchema, type DbConfig } from "kitsune-schemas";

export type { DbConfig };

export function parseDbEnv(
  env: Record<string, string | undefined> = process.env,
): DbConfig {
  const result = dbSchema.safeParse(env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return result.data;
}

export const databaseUrl = parseDbEnv().DATABASE_URL;
