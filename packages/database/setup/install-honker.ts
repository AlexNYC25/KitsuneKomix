import type Database from 'better-sqlite3';

export const installHonkerExtension = (sqliteDatabase: ReturnType<typeof Database>) => {
  sqliteDatabase.loadExtension('/honker/libhonker_ext.so');
  sqliteDatabase.prepare('SELECT honker_bootstrap()').run();
};
