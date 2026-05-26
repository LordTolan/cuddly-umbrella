/**
 * Background worker process.
 *
 * Runs on a separate Render service. Handles:
 * - Emporia polling (every 60s)
 * - SMA polling (every 60s)
 * - Daily billing reconciliation
 * - Alert generation
 */
require('dotenv').config();

const { Worker, Queue, QueueScheduler } = require('bullmq');
const { getRedisConnection } = require('../config/redis');
const prisma = require('../config/database');
const emporiaService = require('../services/emporiaService');
const smaService = require('../services/smaService');
const logger = require('../config/logger');

const connection = getRedisConnection();

// ── Queues ────────────────────────────────────────────────────

const pollQueue = new Queue('energy-polling', { connection });
const analyticsQueue = new Queue('analytics', { connection });

// ── Polling Worker ──────────────────────────────────────────────

const pollWorker = new Worker(
  'energy-polling',
  async (job) => {
    const { deviceId, deviceType } = job.data;

    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device || !device.isActive) return;

    if (deviceType === 'EMPORIA_VUE') {
      await emporiaService.pollDevice(device);
    } else if (deviceType === 'SMA_INVERTER') {
      await smaService.pollDevice(device);
    }
  },
  { connection, concurrency: 5 }
);

pollWorker.on('failed', (job, err) => {
  logger.error(`Poll job ${job.id} failed: ${err.message}`);
});

// ── Analytics Worker ────────────────────────────────────────────

const analyticsWorker = new Worker(
  'analytics',
  async (job) => {
    if (job.name === 'check-alerts') {
      await checkAlerts(job.data.siteId);
    }
  },
  { connection, concurrency: 2 }
);

// ── Alert Checks ────────────────────────────────────────────────

async function checkAlerts(siteId) {
  const devices = await prisma.device.findMany({ where: { siteId } });

  for (const device of devices) {
    // Solar offline check
    if (device.type === 'SMA_INVERTER' && device.lastSyncAt) {
      const minutesSinceSync = (Date.now() - device.lastSyncAt.getTime()) / 60000;
      if (minutesSinceSync > 30) {
        await createAlert(siteId, 'SOLAR_OFFLINE', 'WARNING', 'Solar inverter offline', `${device.name} hasn't reported data in ${Math.round(minutesSinceSync)} minutes.`);
      }
    }

    // Phantom load check (overnight high baseload)
    if (device.type === 'EMPORIA_VUE') {
      const nightStart = new Date();
      nightStart.setHours(2, 0, 0, 0);
      const nightEnd = new Date();
      nightEnd.setHours(5, 0, 0, 0);

      const nightUsage = await prisma.consumptionData.aggregate({
        where: {
          deviceId: device.id,
          timestamp: { gte: nightStart, lte: nightEnd },
        },
        _avg: { watts: true },
      });

      if (nightUsage._avg.watts && nightUsage._avg.watts > 1000) {
        await createAlert(siteId, 'HIGH_BASELOAD', 'INFO', 'High overnight baseload detected', `Average overnight usage: ${Math.round(nightUsage._avg.watts)}W. Consider checking for phantom loads.`);
      }
    }
  }
}

async function createAlert(siteId, type, severity, title, message) {
  // Don't duplicate recent alerts of the same type
  const recent = await prisma.alert.findFirst({
    where: {
      siteId,
      type,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (recent) return;

  await prisma.alert.create({
    data: { siteId, type, severity, title, message },
  });
  logger.info(`Alert created: [${severity}] ${title}`);
}

// ── Scheduler: enqueue polling jobs ─────────────────────────────

async function schedulePolling() {
  const devices = await prisma.device.findMany({
    where: { isActive: true },
  });

  for (const device of devices) {
    await pollQueue.add(
      'poll-device',
      { deviceId: device.id, deviceType: device.type },
      { removeOnComplete: 100, removeOnFail: 50 }
    );
  }

  logger.debug(`Scheduled polling for ${devices.length} devices`);
}

// Poll every 60 seconds
setInterval(schedulePolling, 60 * 1000);

// Check alerts every 15 minutes
setInterval(async () => {
  const sites = await prisma.site.findMany();
  for (const site of sites) {
    await analyticsQueue.add('check-alerts', { siteId: site.id });
  }
}, 15 * 60 * 1000);

// Initial run
schedulePolling();
logger.info('Worker process started');
