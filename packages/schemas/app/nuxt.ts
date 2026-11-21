import { z } from "zod";

import { standardEnvSchema } from "../env/standard";
import { serverEnvSchema } from "../env/server";
import { dbSchema } from "../database/db";

const serverSideSchema = serverEnvSchema.extend({
  ...dbSchema.shape,
});

const publicSideSchema = standardEnvSchema

export const nuxtEnvSchema = serverSideSchema.extend({
  public: publicSideSchema,
})

export type NuxtEnvConfig = z.output<typeof nuxtEnvSchema>