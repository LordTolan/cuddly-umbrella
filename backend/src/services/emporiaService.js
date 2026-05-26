const axios = require('axios');
const config = require('../config/index');
const prisma = require('../config/database');
const logger = require('../config/logger');

/**
 * Emporia Vue Energy Monitor API service.
 *
 * Uses the community-documented REST API. Auth is per-customer
 * (username/password → token stored in Device.apiToken).
 */
class EmporiaService {
  constructor() {
    this.client = axios.create({
      baseURL: config.emporia.baseUrl,
      timeout: 15000,
    });
  }

  // ── Auth ──────────────────────────────────────────────────────

  async login(email, password) {
    // Emporia uses AWS Cognito; the community API wraps it
    const { CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js');
    // For MVP we store the token returned by the Emporia auth endpoint
    const res = await this.client.post('/customers/authentication', {
      email,
      password,
    });
    return res.data; // { authToken, idToken, ... }
  }

  // ── Data Fetching ─────────────────────────────────────────────

  async getInstantUsage(authToken, deviceGid) {
    const res = await this.client.get(`/AppAPI?apiMethod=getInstantDeviceUsage&deviceGid=${deviceGid}`, {
      headers: { authtoken: authToken },
    });
    return res.data;
  }

  async getUsageForTimeRange(authToken, deviceGid, start, end, scale = '1MIN') {
    const res = await this.client.get('/AppAPI', {
      params: {
        apiMethod: 'getChartUsage',
        deviceGid,
        channel: '1,2,3',
        start,
        end,
        scale,
      },
      headers: { authtoken: authToken },
    });
    return res.data;
  }

  async getDevices(authToken) {
    const res = await this.client.get('/customers/devices', {
      headers: { authtoken: authToken },
    });
    return res.data;
  }

  // ── Polling Worker Entry ──────────────────────────────────────

  async pollDevice(device) {
    try {
      const apiConfig = device.apiConfig || {};
      const token = device.apiToken;
      const deviceGid = apiConfig.deviceGid;

      if (!token || !deviceGid) {
        logger.warn(`Emporia device ${device.id} missing credentials`);
        return;
      }

      const usage = await this.getInstantUsage(token, deviceGid);

      if (usage && usage.channels) {
        const records = usage.channels.map((ch) => ({
          deviceId: device.id,
          timestamp: new Date(),
          watts: ch.usage || 0,
          kwh: (ch.usage || 0) / 1000,
          channel: ch.name || `Channel ${ch.channelNum}`,
        }));

        await prisma.consumptionData.createMany({ data: records });

        await prisma.device.update({
          where: { id: device.id },
          data: { lastSyncAt: new Date() },
        });

        logger.debug(`Emporia: stored ${records.length} readings for device ${device.id}`);
      }
    } catch (err) {
      logger.error(`Emporia poll failed for device ${device.id}: ${err.message}`);
    }
  }
}

module.exports = new EmporiaService();
