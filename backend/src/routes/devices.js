const { Router } = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const emporiaService = require('../services/emporiaService');
const smaService = require('../services/smaService');

const router = Router();

router.use(authenticate);

/**
 * GET /devices
 * List all devices for the current user's sites.
 */
router.get('/', async (req, res) => {
  const devices = await prisma.device.findMany({
    where: { site: { userId: req.user.id } },
    include: { site: true },
  });
  res.json({ devices });
});

/**
 * POST /devices/connect
 * Connect a new device (Emporia or SMA).
 */
router.post('/connect', async (req, res, next) => {
  try {
    const { siteId, type, credentials } = req.body;

    // Verify site belongs to user
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user.id },
    });
    if (!site) return res.status(404).json({ error: 'Site not found' });

    let apiToken, apiConfig, name;

    if (type === 'EMPORIA_VUE') {
      // Authenticate with Emporia
      const authResult = await emporiaService.login(credentials.email, credentials.password);
      apiToken = authResult.authToken || authResult.idToken;

      // Fetch devices to get the GID
      const devices = await emporiaService.getDevices(apiToken);
      const firstDevice = devices?.devices?.[0];

      apiConfig = {
        deviceGid: firstDevice?.deviceGid,
        emporiaEmail: credentials.email,
      };
      name = firstDevice?.locationProperties?.deviceName || 'Emporia Vue';
    } else if (type === 'SMA_INVERTER') {
      // Authenticate with SMA
      const authResult = await smaService.login(credentials.username, credentials.password);
      apiToken = authResult.access_token;

      // Fetch plants
      const plants = await smaService.getPlants(apiToken);
      const firstPlant = plants?.plants?.[0];

      apiConfig = {
        plantId: firstPlant?.plantId,
        refreshToken: authResult.refresh_token,
      };
      name = firstPlant?.name || 'SMA Sunny Boy';
    } else {
      return res.status(400).json({ error: 'Invalid device type' });
    }

    const device = await prisma.device.create({
      data: {
        siteId,
        type,
        name,
        apiToken,
        apiConfig,
        serialNumber: credentials.serialNumber || null,
      },
    });

    res.status(201).json({ device: { ...device, apiToken: undefined } });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /devices/:id
 */
router.delete('/:id', async (req, res) => {
  const device = await prisma.device.findFirst({
    where: { id: req.params.id, site: { userId: req.user.id } },
  });
  if (!device) return res.status(404).json({ error: 'Device not found' });

  await prisma.device.delete({ where: { id: device.id } });
  res.json({ success: true });
});

module.exports = router;
