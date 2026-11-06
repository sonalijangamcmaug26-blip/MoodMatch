// Optional helper: npm run db:setup
// Runs database/schema.sql and database/seed.sql using the credentials in .env.
// WARNING: schema.sql drops and recreates the `moodmatch` database.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import env from '../config/env.js';

const dbFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../database');

const connection = await mysql.createConnection({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  multipleStatements: true,
  charset: 'utf8mb4',
});

try {
  for (const file of ['schema.sql', 'seed.sql']) {
    const sql = await readFile(path.join(dbFolder, file), 'utf8');
    await connection.query(sql);
    console.log(`Ran ${file}`);
  }
  console.log('Database ready.');
} catch (error) {
  console.error('Database setup failed:', error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
