import {
  clientEnvSchema,
  envSchema,
  serverEnvSchema
} from "kitsune-komix-schemas";
         
// DEPRECATED: This is an older schema that acted as an all in one schema for both the server and client. It is now recommended to use the serverEnvSchema and clientEnvSchema separately.
export const env = envSchema.parse(process.env);

export const serverEnv = serverEnvSchema.parse(process.env);
export const clientEnv = clientEnvSchema.parse(import.meta.env);
