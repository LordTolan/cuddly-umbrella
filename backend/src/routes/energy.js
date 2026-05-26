const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');
const prisma = require('../config/database');
const dayjs = require('dayjs');

const router = Router();

router.use(authenticate);

/**
 * GET /energy/live
 * Live dashboard data for a site.
 */
router.get('/live', async (req, res, next) => {
  try {
    const { siteId } = req.query;
    if (!siteId) return res.status(400).json({ error: 'siteId required' });

    // Verify ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const summary = await analyticsService.getDashboardSummary(siteId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /energy/history
 * Historical consumption + solar data.
 * Query: siteId, start, end, resolution (hourly|daily|weekly)
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
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /energy/offset
 * Solar offset analysis.
 */
router.get('/offset', async (req, res, next) => {
  try {
    const { siteId, start, end } = req.query;
    const startDate = start ? new Date(start) : dayjs().startOf('month').toDate();
    const endDate = end ? new Date(end) : new Date();

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const offset = await analyticsService.getSolarOffset(siteId, startDate, endDate);
    res.json(offset);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /energy/savings
 * Estimated savings from solar.
 */
router.get('/savings', async (req, res, next) => {
  try {
    const { siteId, start, end, rate } = req.query;
    const startDate = start ? new Date(start) : dayjs().startOf('year').toDate();
    const endDate = end ? new Date(end) : new Date();
    const ratePerKwh = rate ? parseFloat(rate) : 0.12;

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const savings = await analyticsService.getEstimatedSavings(siteId, startDate, endDate, ratePerKwh);
    res.json(savings);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /energy/peak
 * Peak demand analysis.
 */
router.get('/peak', async (req, res, next) => {
  try {
    const { siteId, start, end } = req.query;
    const startDate = start ? new Date(start) : dayjs().startOf('month').toDate();
    const endDate = end ? new Date(end) : new Date();

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const peak = await analyticsService.getPeakDemand(siteId, startDate, endDate);
    res.json(peak);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
