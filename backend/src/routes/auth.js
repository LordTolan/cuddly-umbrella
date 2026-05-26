const { Router } = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = Router();

/**
 * POST /auth/register
 * Called after Firebase client-side signup to create the DB user.
 * The authenticate middleware already upserts, so this just returns the user.
 */
router.post('/register', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

/**
 * POST /auth/login
 * Validates token and returns user profile + sites.
 */
router.post('/login', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { sites: { include: { devices: true } } },
  });
  res.json({ user });
});

/**
 * GET /auth/me
 * Current user profile.
 */
router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { sites: { include: { devices: true } } },
  });
  res.json({ user });
});

module.exports = router;
