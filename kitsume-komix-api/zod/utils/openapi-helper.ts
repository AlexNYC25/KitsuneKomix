import { z } from "@hono/zod-openapi";
import type { ZodSchema, ZodType } from "zod";
import camelcasekeys from "camelcase-keys";

// Type alias for camelcasekeys
type ObjectLike = Record<string, unknown> | readonly unknown[];

/**
 * Recursively generates OpenAPI property definitions from a Zod schema
 */
function zodToOpenAPIProperties(schema: ZodSchema): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, ZodType>;
    for (const [key, fieldSchema] of Object.entries(shape)) {
      properties[key] = zodToOpenAPIType(fieldSchema);
    }
  }

  return properties;
}

/**
 * Converts a Zod schema to an OpenAPI type definition
 */
function zodToOpenAPIType(schema: ZodSchema): unknown {
  // First check if the schema has explicit OpenAPI metadata
  const metadata = (schema as unknown as { _metadata?: Record<string, unknown> })?._metadata;
  if (metadata?.properties) {
    // If it has explicit properties metadata, return it as-is
    return metadata;
  }

  // Handle Effects (includes transforms and refinements) - check for _schema property
  if ("_schema" in (schema as unknown as Record<string, unknown>)) {
    const innerSchema = (schema as unknown as { _schema: ZodType })._schema;
    if (innerSchema) {
      return zodToOpenAPIType(innerSchema);
    }
  }

  // Handle nullable/optional
  if (schema instanceof z.ZodNullable) {
    const inner = zodToOpenAPIType((schema as unknown as { unwrap(): ZodType }).unwrap());
    const innerObj = inner as Record<string, unknown>;
    return {
      type: Array.isArray(innerObj.type) ? innerObj.type : [innerObj.type, "null"],
      ...innerObj,
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToOpenAPIType((schema as unknown as { unwrap(): ZodType }).unwrap());
  }

  if (schema instanceof z.ZodDefault) {
    return zodToOpenAPIType((schema as unknown as { removeDefault(): ZodType }).removeDefault());
  }

  // Handle unions
  if (schema instanceof z.ZodUnion) {
    return { type: "object", additionalProperties: true };
  }

  // Handle arrays
  if (schema instanceof z.ZodArray) {
    const elementType = zodToOpenAPIType((schema as unknown as { element: ZodType }).element);
    return {
      type: "array",
      items: elementType,
    };
  }

  // Handle objects
  if (schema instanceof z.ZodObject) {
    const properties = zodToOpenAPIProperties(schema);
    return {
      type: "object",
      properties,
    };
  }

  // Handle basic types
  if (schema instanceof z.ZodString) {
    return { type: "string" };
  }

  if (schema instanceof z.ZodNumber) {
    return { type: "number" };
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }

  if (schema instanceof z.ZodDate) {
    return { type: "string", format: "date-time" };
  }

  // Default
  return { type: "object" };
}

export function generateOpenAPISchema(
  schema: ZodSchema,
  title: string,
  description: string,
  example?: unknown
): Record<string, unknown> {
  const properties = zodToOpenAPIProperties(schema);
  const requiredFields = schema instanceof z.ZodObject
    ? Object.keys(schema.shape as Record<string, ZodType>).filter(
        (key) => {
          const field = (schema.shape as Record<string, ZodType>)[key];
          return (
            !(field instanceof z.ZodOptional) &&
            !(field instanceof z.ZodNullable)
          );
        }
      )
    : [];

  const result: Record<string, unknown> = {
    title,
    description,
    type: "object",
    properties,
  };

  if (requiredFields.length > 0) {
    result.required = requiredFields;
  }

  if (example) {
    result.example = example;
  }

  return result;
}

/**
 * Simpler version that just adds metadata to a transformed schema
 * Use this when you want to add OpenAPI info without manually defining properties
 */
export function addOpenAPIMetadata(
  title: string,
  description: string,
  example?: unknown
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    title,
    description,
  };

  if (example) {
    result.example = example;
  }

  return result;
}

/**
 * Creates a camelCase transformed response schema with proper OpenAPI metadata
 * This is the main helper to reduce boilerplate for response schemas
 * 
 * @param baseSchema - The base Zod schema (usually with snake_case fields from DB)
 * @param title - OpenAPI title for the schema
 * @param description - OpenAPI description
 * @param example - Example response data
 * @returns A schema that transforms to camelCase and includes OpenAPI metadata
 */
export function createCamelCaseResponseSchema(
  baseSchema: ZodSchema,
  title: string,
  description: string,
  example?: unknown
) {
  // Extract properties from the base schema
  const properties = zodToOpenAPIProperties(baseSchema);
  
  // Determine required fields
  const requiredFields: string[] = [];
  if (baseSchema instanceof z.ZodObject) {
    const shape = baseSchema.shape as Record<string, ZodType>;
    for (const [key, fieldSchema] of Object.entries(shape)) {
      if (!(fieldSchema instanceof z.ZodOptional) && !(fieldSchema instanceof z.ZodNullable)) {
        requiredFields.push(key);
      }
    }
  }

  return baseSchema
    .transform((data: unknown) => {
      const dataObj = data as Record<string, unknown>;
      // If it's a response wrapper with 'data' property, only transform that
      if ("data" in dataObj && "message" in dataObj) {
        return {
          data: camelcasekeys(dataObj.data as ObjectLike, { deep: true }),
          message: dataObj.message,
        };
      }
      // Otherwise transform the whole object
      return camelcasekeys(data as ObjectLike, { deep: true });
    })
    .openapi({
      title,
      description,
      type: "object" as const,
      properties: properties as Record<string, unknown>,
      required: requiredFields.length > 0 ? requiredFields : undefined,
      example,
    } as unknown as Record<string, unknown>);
}
