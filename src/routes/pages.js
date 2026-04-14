const router = require('express').Router();
const prisma = require('../lib/prisma');

// GET /api/journals/:journalId/pages
router.get('/:journalId/pages', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const pages = await prisma.page.findMany({
    where: { journal_id: req.params.journalId, user_id },
    orderBy: { entry_date: 'desc' },
  });
  res.json(pages);
});

// POST /api/journals/:journalId/pages
router.post('/:journalId/pages', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const journal = await prisma.journal.findFirst({ where: { id: req.params.journalId, user_id } });
  if (!journal) return res.status(404).json({ error: 'Journal not found' });
  const page = await prisma.page.create({
    data: { ...req.body, journal_id: req.params.journalId, user_id },
  });
  res.status(201).json(page);
});

// GET /api/pages/:id
router.get('/pages/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const page = await prisma.page.findFirst({ where: { id: req.params.id, user_id } });
  if (!page) return res.status(404).json({ error: 'Not found' });
  res.json(page);
});

// PUT /api/pages/:id
router.put('/pages/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const existing = await prisma.page.findFirst({ where: { id: req.params.id, user_id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const page = await prisma.page.update({ where: { id: req.params.id }, data: req.body });
  res.json(page);
});

// DELETE /api/pages/:id
router.delete('/pages/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const existing = await prisma.page.findFirst({ where: { id: req.params.id, user_id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await prisma.page.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = router;
