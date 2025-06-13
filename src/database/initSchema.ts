import { Database } from "@db/sqlite";

import logger from '../utilities/logger.ts';
import {
  createComicsTable
} from './schemaDefinitions.ts';

export function initializeSchema(db: Database): void {
  logger.info('SETUP', 'Running schema setup...');
  db.exec(
    [
      createComicsTable,
    ].join('\n\n')
  );
  logger.info('SETUP', 'Schema initialized (tables created if missing).');
}
