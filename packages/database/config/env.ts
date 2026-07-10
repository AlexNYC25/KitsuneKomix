import {dbSchema} from "../shared/schemas/db.schema"

export const env = dbSchema.parse(process.env);