const router = require('express').Router();
const prisma = require('../lib/prisma');

// GET /api/users/me
router.get('/me', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const profile = await prisma.userProfile.findUnique({ where: { user_id } });
  res.json(profile || {});
});

// POST /api/users/me  (upsert — handles both create and update)
router.post('/me', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const profile = await prisma.userProfile.upsert({
    where: { user_id },
    update: req.body,
    create: { ...req.body, user_id },
  });
  res.json(profile);
});

module.exports = router;
