import app from './app.js';
import { testConnection } from './config/db.js';
import env from './config/env.js';

try {
  await testConnection();
  console.log('Connected to MySQL database:', env.db.database);
} catch (error) {
  console.error('Could not connect to MySQL:', error.message);
  console.error('Check the DB_* values in backend/.env and make sure MySQL is running.');
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`MoodMatch API running on http://localhost:${env.port}/api`);
});
