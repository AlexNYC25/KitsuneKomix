import { nuxtEnvSchema, type NuxtEnvConfig } from "kitsune-schemas";

export type { NuxtEnvConfig };

export function parseNuxtEnv(
  env: Record<string, string | undefined> = process.env,
): NuxtEnvConfig {
  const result = nuxtEnvSchema.safeParse({ ...env, public: env });

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return result.data;
}
