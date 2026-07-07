import * as schemas from "../schemas/index.ts";

import { sqliteGenerate } from "drizzle-dbml-generator";

const out = Bun.fileURLToPath(new URL("../../../../docs/schema.dbml", import.meta.url));
const relational = false;

export const generateDbml = () => {
  sqliteGenerate({schema:schemas, out, relational});
};