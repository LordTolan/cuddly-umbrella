const { Router } = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

/**
 * GET /alerts
 * List alerts for a site.
 */
router.get('/', async (req, res, next) => {
  try {
    const { siteId, unreadOnly } = req.query;

    const where = {
      siteId,
      ...(unreadOnly === 'true' ? { readAt: null } : {}),
    };

    // Verify ownership
    if (siteId) {
      const site = await prisma.site.findFirst({
        where: { id: siteId, userId: req.user.id },
      });
      if (!site) return res.status(404).json({ error: 'Site not found' });
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ alerts });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /alerts/:id/read
 * Mark an alert as read.
 */
router.patch('/:id/read', async (req, res, next) => {
  try {
    const alert = await prisma.alert.findUnique({ where: { id: req.params.id } });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    const updated = await prisma.alert.update({
      where: { id: alert.id },
      data: { readAt: new Date() },
    });

    res.json({ alert: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
