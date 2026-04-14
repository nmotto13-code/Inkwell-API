const router = require('express').Router();
const prisma = require('../lib/prisma');

// GET /api/goals
router.get('/', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const goals = await prisma.journalingGoal.findMany({
    where: { user_id },
    orderBy: { created_date: 'desc' },
  });
  res.json(goals);
});

// POST /api/goals
router.post('/', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const goal = await prisma.journalingGoal.create({ data: { ...req.body, user_id } });
  res.status(201).json(goal);
});

// PUT /api/goals/:id
router.put('/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const existing = await prisma.journalingGoal.findFirst({ where: { id: req.params.id, user_id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const goal = await prisma.journalingGoal.update({ where: { id: req.params.id }, data: req.body });
  res.json(goal);
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const existing = await prisma.journalingGoal.findFirst({ where: { id: req.params.id, user_id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await prisma.journalingGoal.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = router;
