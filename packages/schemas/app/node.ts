import { z } from "zod";

import { standardEnvSchema } from "../env/standard";
import { serverEnvSchema } from "../env/server";
import { dbSchema } from "../database/db";

export const nodeEnvSchema = serverEnvSchema.extend({
  ...dbSchema.shape,
  ...standardEnvSchema.shape,
});

export type NodeEnvConfig = z.output<typeof nodeEnvSchema>