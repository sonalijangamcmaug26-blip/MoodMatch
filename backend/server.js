import app from './app.js';
import { testConnection } from './config/db.js';
import env from './config/env.js';

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`MoodMatch API running on http://localhost:${port}/api`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Retrying on port ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error('Server failed to start:', error.message);
    process.exit(1);
  });
};

try {
  await testConnection();
  console.log('Connected to MySQL database:', env.db.database);
} catch (error) {
  console.error('Could not connect to MySQL:', error.message);
  console.error('Check the DB_* values in backend/.env and make sure MySQL is running.');
  process.exit(1);
}

startServer(env.port);
