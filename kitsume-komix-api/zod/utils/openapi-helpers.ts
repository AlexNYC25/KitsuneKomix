import { z } from "@hono/zod-openapi";
import type { ZodTypeAny, ZodRawShape } from "zod";

/**
 * Transform snake_case keys to camelCase keys in a Zod object shape.
 * This creates a new OpenAPI-compatible schema with camelCase keys.
 * 
 * Note: This does NOT use .transform() so it's fully OpenAPI compatible.
 * It creates a new static schema definition with camelCase field names.
 * 
 * @param schema - The original Zod object schema with snake_case keys
 * @param openapiConfig - Optional OpenAPI configuration (title, description)
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
): z.ZodObject<Record<string, ZodTypeAny>> {
  // Access the shape directly - it's available on ZodObject
  // The shape can be either a function or an object depending on Zod version
  const shapeOrGetter = (schema as unknown as { _def: { shape: () => T } | { shape: T } })._def.shape;
  const shape = typeof shapeOrGetter === "function" ? shapeOrGetter() : shapeOrGetter;
  const camelShape: Record<string, ZodTypeAny> = {};
  
  for (const [key, value] of Object.entries(shape)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelShape[camelKey] = value as ZodTypeAny;
  }
  
  return z.object(camelShape).openapi(openapiConfig || {});
}
