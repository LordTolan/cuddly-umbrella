const axios = require('axios');
const config = require('../config/index');
const prisma = require('../config/database');
const logger = require('../config/logger');

/**
 * SMA Sunny Portal API service.
 *
 * Retrieves solar production data from SMA Sunny Boy inverters
 * via the Sunny Portal REST API.
 */
class SmaService {
  constructor() {
    this.client = axios.create({
      baseURL: config.sma.baseUrl,
      timeout: 15000,
    });
  }

  // ── Auth ──────────────────────────────────────────────────────

  async login(username, password) {
    const res = await this.client.post('/token', {
      grant_type: 'password',
      username,
      password,
    });
    return res.data; // { access_token, refresh_token, ... }
  }

  async refreshToken(refreshToken) {
    const res = await this.client.post('/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    return res.data;
  }

  // ── Data Fetching ─────────────────────────────────────────────

  async getPlants(accessToken) {
    const res = await this.client.get('/plants', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  }

  async getLiveData(accessToken, plantId) {
    const res = await this.client.get(`/plants/${plantId}/livedata`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  }

  async getHistoricalData(accessToken, plantId, startDate, endDate) {
    const res = await this.client.get(`/plants/${plantId}/data`, {
      params: { startDate, endDate, resolution: 'FifteenMinutes' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  }

  // ── Polling Worker Entry ──────────────────────────────────────

  async pollDevice(device) {
    try {
      const apiConfig = device.apiConfig || {};
      let accessToken = device.apiToken;
      const plantId = apiConfig.plantId;

      if (!accessToken || !plantId) {
        logger.warn(`SMA device ${device.id} missing credentials`);
        return;
      }

      // Try to refresh token if we have a refresh token
      if (apiConfig.refreshToken) {
        try {
          const tokens = await this.refreshToken(apiConfig.refreshToken);
          accessToken = tokens.access_token;

          await prisma.device.update({
            where: { id: device.id },
            data: {
              apiToken: accessToken,
              apiConfig: { ...apiConfig, refreshToken: tokens.refresh_token },
            },
          });
        } catch (refreshErr) {
          logger.debug('SMA token refresh skipped:', refreshErr.message);
        }
      }

      const liveData = await this.getLiveData(accessToken, plantId);

      if (liveData) {
        await prisma.solarData.create({
          data: {
            deviceId: device.id,
            timestamp: new Date(),
            kwGenerated: liveData.currentPower || 0,
            kwhGenerated: (liveData.currentPower || 0) / 60, // approx for 1-min interval
            inverterStatus: liveData.status || 'unknown',
          },
        });

        await prisma.device.update({
          where: { id: device.id },
          data: { lastSyncAt: new Date() },
        });

        logger.debug(`SMA: stored reading for device ${device.id} — ${liveData.currentPower} kW`);
      }
    } catch (err) {
      logger.error(`SMA poll failed for device ${device.id}: ${err.message}`);
    }
  }
}

module.exports = new SmaService();
