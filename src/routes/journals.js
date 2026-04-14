const router = require('express').Router();
const prisma = require('../lib/prisma');

// GET /api/journals
router.get('/', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const journals = await prisma.journal.findMany({
    where: { user_id },
    orderBy: { created_date: 'desc' },
    include: { pages: { orderBy: { entry_date: 'desc' }, take: 1 } },
  });
  res.json(journals);
});

// GET /api/journals/:id
router.get('/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const journal = await prisma.journal.findFirst({
    where: { id: req.params.id, user_id },
    include: { pages: { orderBy: { entry_date: 'desc' } } },
  });
  if (!journal) return res.status(404).json({ error: 'Not found' });
  res.json(journal);
});

// POST /api/journals
router.post('/', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const journal = await prisma.journal.create({ data: { ...req.body, user_id } });
  res.status(201).json(journal);
});

// PUT /api/journals/:id
router.put('/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const existing = await prisma.journal.findFirst({ where: { id: req.params.id, user_id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const journal = await prisma.journal.update({ where: { id: req.params.id }, data: req.body });
  res.json(journal);
});

// DELETE /api/journals/:id
router.delete('/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const existing = await prisma.journal.findFirst({ where: { id: req.params.id, user_id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await prisma.journal.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = router;
