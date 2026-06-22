import * as schemas from "../schemas/index.ts";
import { fromFileUrl } from "@std/path";

import { sqliteGenerate } from "drizzle-dbml-generator";

const out = fromFileUrl(new URL("../../../../docs/schema.dbml", import.meta.url));
const relational = false;

export const generateDbml = () => {
  sqliteGenerate({schema:schemas, out, relational});
};