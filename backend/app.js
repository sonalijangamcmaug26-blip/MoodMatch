import cors from 'cors';
import express from 'express';
import env from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// CORS: allow the origins listed in CLIENT_URL. While developing, also allow
// localhost / 127.0.0.1 on any port, because Vite moves to 5174, 5175 ...
// when 5173 is busy and the browser treats each origin as different.
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
app.use(
  cors({
    origin(origin, callback) {
      const allowed =
        !origin || // curl, Postman, server-to-server
        env.clientUrls.includes(origin) ||
        (!env.isProduction && LOCAL_ORIGIN.test(origin));
      callback(null, allowed);
    },
  })
);
app.use(express.json({ limit: '10kb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
