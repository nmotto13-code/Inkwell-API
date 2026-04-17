import { Router } from 'express';

import prisma from '../lib/prisma.js';

const router = Router();

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);

const normalizeString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const normalized = String(value).trim();
  return normalized ? normalized : null;
};

const normalizeStringArray = (value) => (
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((entry) => String(entry || '').trim())
        .filter(Boolean)
    )
  )
);

const normalizeOptionalInt = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    const error = new Error('daily_play_goal_minutes must be a non-negative integer');
    error.status = 400;
    throw error;
  }

  return parsed;
};

const serializeUserProfile = (profile) => {
  if (!profile) {
    return {
      enrolled_tracks: [],
      selected_modes: [],
      onboarding_completed: false,
      mobile_onboarding_complete: false,
      daily_play_goal_minutes: null,
      onboarding_preferences: null,
    };
  }

  return {
    ...profile,
    enrolled_tracks: Array.isArray(profile.enrolled_tracks) ? profile.enrolled_tracks : [],
    selected_modes: Array.isArray(profile.selected_modes) ? profile.selected_modes : [],
    mobile_onboarding_complete: Boolean(profile.onboarding_completed),
    daily_play_goal_minutes: profile.daily_play_goal_minutes ?? null,
    onboarding_preferences: profile.onboarding_preferences ?? null,
  };
};

const buildUserProfileData = (body = {}) => {
  const data = {};
  const stringFields = [
    'first_name',
    'age_range',
    'gender',
    'industry',
    'job_title',
    'journaling_goal',
    'journaling_experience',
    'reflection_time',
    'notification_preference',
  ];

  for (const field of stringFields) {
    if (hasOwn(body, field)) {
      data[field] = normalizeString(body[field]);
    }
  }

  if (hasOwn(body, 'enrolled_tracks')) {
    data.enrolled_tracks = normalizeStringArray(body.enrolled_tracks);
  }

  if (hasOwn(body, 'selected_modes')) {
    data.selected_modes = normalizeStringArray(body.selected_modes);
  }

  if (hasOwn(body, 'track_sensitivity')) {
    data.track_sensitivity = body.track_sensitivity ?? null;
  }

  if (hasOwn(body, 'onboarding_preferences')) {
    data.onboarding_preferences = body.onboarding_preferences ?? null;
  }

  if (hasOwn(body, 'daily_play_goal_minutes')) {
    data.daily_play_goal_minutes = normalizeOptionalInt(body.daily_play_goal_minutes);
  }

  if (hasOwn(body, 'onboarding_completed')) {
    data.onboarding_completed = Boolean(body.onboarding_completed);
  }

  if (hasOwn(body, 'mobile_onboarding_complete')) {
    data.onboarding_completed = Boolean(body.mobile_onboarding_complete);
  }

  return data;
};

const upsertUserProfile = async (user_id, body) => {
  const data = buildUserProfileData(body);

  return prisma.userProfile.upsert({
    where: { user_id },
    update: data,
    create: {
      user_id,
      enrolled_tracks: [],
      selected_modes: [],
      ...data,
    },
  });
};

// GET /api/users/me
router.get('/me', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const profile = await prisma.userProfile.findUnique({ where: { user_id } });
  res.json(serializeUserProfile(profile));
});

// PATCH /api/users/me/settings
router.patch('/me/settings', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const profile = await upsertUserProfile(user_id, {
    daily_play_goal_minutes: req.body?.daily_play_goal_minutes,
  });
  res.json(serializeUserProfile(profile));
});

// PATCH /api/users/me/mobile-onboarding
router.patch('/me/mobile-onboarding', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const profile = await upsertUserProfile(user_id, {
    mobile_onboarding_complete: req.body?.mobile_onboarding_complete,
    selected_modes: req.body?.selected_modes,
    onboarding_preferences: req.body?.onboarding_preferences,
  });
  res.json(serializeUserProfile(profile));
});

// POST /api/users/me
router.post('/me', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const profile = await upsertUserProfile(user_id, req.body);
  res.json(serializeUserProfile(profile));
});

// PATCH /api/users/me
router.patch('/me', async (req, res) => {
  const user_id = req.auth.payload.sub;
  const profile = await upsertUserProfile(user_id, req.body);
  res.json(serializeUserProfile(profile));
});

export default router;
