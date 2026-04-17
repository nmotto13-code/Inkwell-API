import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { requireAuth } from './middleware/auth.js';
import childrenRouter from './routes/children.js';
import entriesRouter from './routes/entries.js';
import goalsRouter from './routes/goals.js';
import journalsRouter from './routes/journals.js';
import pagesRouter from './routes/pages.js';
import usersRouter from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = new Set(
  String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (
      allowedOrigins.has(origin) ||
      origin.startsWith('capacitor://') ||
      origin.startsWith('ionic://')
    ) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
}));
app.use(express.json());

// Health check - no auth required
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// All routes below require a valid Auth0 JWT
app.use('/api', requireAuth);
app.use('/api/entries', entriesRouter);
app.use('/api/journals', journalsRouter);
app.use('/api/journals', pagesRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/children', childrenRouter);
app.use('/api/users', usersRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  if (err.status === 401) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(err.status || 500).json({
    error: err.status ? err.message : 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`InkWell API running on port ${PORT}`);
});
