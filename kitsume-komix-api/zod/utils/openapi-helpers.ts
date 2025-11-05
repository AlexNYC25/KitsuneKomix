import { z } from "@hono/zod-openapi";
import type { ZodTypeAny, ZodRawShape } from "zod";

/**
 * Transform snake_case keys to camelCase keys in a Zod object shape.
 * This creates a new OpenAPI-compatible schema with camelCase keys.
 * 
 * Note: This does NOT use .transform() so it's fully OpenAPI compatible.
 * It creates a new static schema definition with camelCase field names.
 * 
 * @example
 * const userSchema = createSelectSchema(usersTable);
 * const userCamelCase = toCamelCaseSchema(userSchema, {
 *   title: "User",
 *   description: "User object with camelCase keys"
 * });
 */
export function toCamelCaseSchema<T extends ZodRawShape>(
  schema: z.ZodObject<T>,
  openapiConfig?: {
    title?: string;
    description?: string;
  }
  // deno-lint-ignore no-explicit-any
): z.ZodObject<any> {
  // deno-lint-ignore no-explicit-any
  const def = schema._def as any;
  const shape = typeof def.shape === "function" ? def.shape() : def.shape;
  const camelShape: Record<string, ZodTypeAny> = {};
  
  for (const [key, value] of Object.entries(shape)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelShape[camelKey] = value as ZodTypeAny;
  }
  
  return z.object(camelShape).openapi(openapiConfig || {});
}
