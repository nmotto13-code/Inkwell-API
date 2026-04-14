require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { requireAuth } = require('./middleware/auth');

const entriesRouter = require('./routes/entries');
const journalsRouter = require('./routes/journals');
const pagesRouter = require('./routes/pages');
const goalsRouter = require('./routes/goals');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json());

// Health check — no auth required
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// All routes below require a valid Auth0 JWT
app.use('/api', requireAuth);
app.use('/api/entries', entriesRouter);
app.use('/api/journals', journalsRouter);
app.use('/api/journals', pagesRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/users', usersRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.status === 401) return res.status(401).json({ error: 'Unauthorized' });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`InkWell API running on port ${PORT}`));
