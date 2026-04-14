const router = require('express').Router();
const prisma = require('../lib/prisma');

// GET /api/entries
router.get('/', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const { track, mood, limit = 50, offset = 0 } = req.query;
  const where = { user_id, ...(track && { track }), ...(mood && { mood }) };
  const entries = await prisma.journalEntry.findMany({
    where,
    orderBy: { entry_date: 'desc' },
    take: Number(limit),
    skip: Number(offset),
  });
  res.json(entries);
});

// GET /api/entries/:id
router.get('/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const entry = await prisma.journalEntry.findFirst({ where: { id: req.params.id, user_id } });
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry);
});

// POST /api/entries
router.post('/', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const entry = await prisma.journalEntry.create({ data: { ...req.body, user_id } });
  res.status(201).json(entry);
});

// PUT /api/entries/:id
router.put('/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const existing = await prisma.journalEntry.findFirst({ where: { id: req.params.id, user_id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const entry = await prisma.journalEntry.update({ where: { id: req.params.id }, data: req.body });
  res.json(entry);
});

// DELETE /api/entries/:id
router.delete('/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const existing = await prisma.journalEntry.findFirst({ where: { id: req.params.id, user_id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await prisma.journalEntry.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = router;
