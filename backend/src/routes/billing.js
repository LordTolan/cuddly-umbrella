const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const billingService = require('../services/billingService');
const prisma = require('../config/database');

const router = Router();

// File upload config
const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.csv'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and CSV files are supported'));
    }
  },
});

router.use(authenticate);

/**
 * POST /billing/upload
 * Upload a Duke Energy bill (PDF or CSV).
 */
router.post('/upload', upload.single('bill'), async (req, res, next) => {
  try {
    const { siteId } = req.body;
    if (!siteId) return res.status(400).json({ error: 'siteId required' });

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    let parsedData;

    if (ext === '.pdf') {
      parsedData = await billingService.parsePdfBill(req.file.path);
    } else {
      parsedData = billingService.parseCsvBill(req.file.path);
    }

    const bill = await billingService.storeBill(siteId, parsedData, req.file.originalname);

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.status(201).json({ bill, parsed: parsedData });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /billing/analysis
 * Get billing validation for a specific bill.
 */
router.get('/analysis', async (req, res, next) => {
  try {
    const { billId } = req.query;
    if (!billId) return res.status(400).json({ error: 'billId required' });

    const bill = await prisma.utilityBill.findUnique({
      where: { id: billId },
      include: { site: true },
    });
    if (!bill || bill.site.userId !== req.user.id) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const validation = await billingService.validateBill(billId);
    res.json(validation);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /billing/history
 * List all bills for a site.
 */
router.get('/history', async (req, res, next) => {
  try {
    const { siteId } = req.query;
    if (!siteId) return res.status(400).json({ error: 'siteId required' });

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const bills = await prisma.utilityBill.findMany({
      where: { siteId },
      orderBy: { periodStart: 'desc' },
    });

    res.json({ bills });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
