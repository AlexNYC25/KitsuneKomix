import { nodeEnvSchema, type NodeEnvConfig } from "kitsune-schemas";

export type { NodeEnvConfig };

export function parseNodeEnv(
  env: Record<string, string | undefined> = process.env,
): NodeEnvConfig {
  const result = nodeEnvSchema.safeParse(env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  return result.data;
}
