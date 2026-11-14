import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const dbFileName = process.env.NUXT_DB_FILE_NAME || 'database.sqlite';

const db = drizzle(dbFileName);