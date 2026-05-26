const { Router } = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

/**
 * GET /sites
 * List user's sites.
 */
router.get('/', async (req, res) => {
  const sites = await prisma.site.findMany({
    where: { userId: req.user.id },
    include: { devices: true, bills: { orderBy: { periodStart: 'desc' }, take: 1 } },
  });
  res.json({ sites });
});

/**
 * POST /sites
 * Create a new site.
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, address, utilityProvider } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const site = await prisma.site.create({
      data: {
        userId: req.user.id,
        name,
        address: address || null,
        utilityProvider: utilityProvider || 'Duke Energy',
      },
    });

    res.status(201).json({ site });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /sites/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const site = await prisma.site.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const updated = await prisma.site.update({
      where: { id: site.id },
      data: {
        name: req.body.name || site.name,
        address: req.body.address !== undefined ? req.body.address : site.address,
        utilityProvider: req.body.utilityProvider || site.utilityProvider,
      },
    });

    res.json({ site: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /sites/:id
 */
router.delete('/:id', async (req, res) => {
  const site = await prisma.site.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!site) return res.status(404).json({ error: 'Site not found' });

  await prisma.site.delete({ where: { id: site.id } });
  res.json({ success: true });
});

module.exports = router;
