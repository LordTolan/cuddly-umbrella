const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');
const prisma = require('../config/database');
const dayjs = require('dayjs');

const router = Router();

router.use(authenticate);

/**
 * GET /solar/live
 * Current solar production for a site.
 */
router.get('/live', async (req, res, next) => {
  try {
    const { siteId } = req.query;
    if (!siteId) return res.status(400).json({ error: 'siteId required' });

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const latest = await prisma.solarData.findFirst({
      where: { device: { siteId, type: 'SMA_INVERTER' } },
      orderBy: { timestamp: 'desc' },
      include: { device: true },
    });

    // Today's totals
    const todayStart = dayjs().startOf('day').toDate();
    const todayTotal = await prisma.solarData.aggregate({
      where: {
        device: { siteId, type: 'SMA_INVERTER' },
        timestamp: { gte: todayStart },
      },
      _sum: { kwhGenerated: true },
    });

    // Month total
    const monthStart = dayjs().startOf('month').toDate();
    const monthTotal = await prisma.solarData.aggregate({
      where: {
        device: { siteId, type: 'SMA_INVERTER' },
        timestamp: { gte: monthStart },
      },
      _sum: { kwhGenerated: true },
    });

    res.json({
      current: {
        kw: latest?.kwGenerated || 0,
        status: latest?.inverterStatus || 'unknown',
        lastUpdate: latest?.timestamp,
      },
      today: { kwhGenerated: todayTotal._sum.kwhGenerated || 0 },
      month: { kwhGenerated: monthTotal._sum.kwhGenerated || 0 },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /solar/history
 * Historical solar production.
 */
router.get('/history', async (req, res, next) => {
  try {
    const { siteId, start, end, resolution = 'hourly' } = req.query;
    if (!siteId || !start || !end) {
      return res.status(400).json({ error: 'siteId, start, and end required' });
    }

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const data = await analyticsService.getHistoricalData(
      siteId,
      new Date(start),
      new Date(end),
      resolution
    );
    res.json({ solar: data.solar });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /solar/self-consumption
 * Self-consumption ratio analysis.
 */
router.get('/self-consumption', async (req, res, next) => {
  try {
    const { siteId, start, end } = req.query;
    const startDate = start ? new Date(start) : dayjs().startOf('month').toDate();
    const endDate = end ? new Date(end) : new Date();

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const result = await analyticsService.getSelfConsumptionRatio(siteId, startDate, endDate);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
