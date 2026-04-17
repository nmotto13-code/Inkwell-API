import { Router } from 'express';

import prisma from '../lib/prisma.js';

const router = Router();

const normalizeStringArray = (value) => (
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((entry) => String(entry || '').trim())
        .filter(Boolean)
    )
  )
);

const parseBirthdate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error('birthdate must be a valid date');
    error.status = 400;
    throw error;
  }

  return parsed;
};

// GET /api/children
router.get('/', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const children = await prisma.childProfile.findMany({
    where: { user_id },
    orderBy: { created_date: 'desc' },
  });
  res.json(children);
});

// POST /api/children
router.post('/', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const name = String(req.body?.name || '').trim();

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const child = await prisma.childProfile.create({
    data: {
      user_id,
      name,
      birthdate: parseBirthdate(req.body?.birthdate),
      known_allergens: normalizeStringArray(req.body?.known_allergens),
      developmental_focus: normalizeStringArray(req.body?.developmental_focus),
      profile: req.body || {},
    },
  });

  res.status(201).json(child);
});

export default router;
