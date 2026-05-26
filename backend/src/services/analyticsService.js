const prisma = require('../config/database');
const dayjs = require('dayjs');

/**
 * Core analytics engine.
 *
 * Computes solar offset, self-consumption, savings estimates,
 * peak demand, and TOU optimization insights.
 */
class AnalyticsService {
  // ── Dashboard Summary ─────────────────────────────────────────

  async getDashboardSummary(siteId) {
    const now = new Date();
    const todayStart = dayjs().startOf('day').toDate();
    const monthStart = dayjs().startOf('month').toDate();

    const [liveConsumption, liveSolar, todayConsumption, todaySolar, monthConsumption, monthSolar] =
      await Promise.all([
        this._latestReading(siteId, 'EMPORIA_VUE'),
        this._latestReading(siteId, 'SMA_INVERTER'),
        this._sumKwh(siteId, 'consumption', todayStart, now),
        this._sumKwh(siteId, 'solar', todayStart, now),
        this._sumKwh(siteId, 'consumption', monthStart, now),
        this._sumKwh(siteId, 'solar', monthStart, now),
      ]);

    const netGridNow = (liveConsumption?.watts || 0) - (liveSolar?.kwGenerated || 0) * 1000;

    return {
      live: {
        consumptionWatts: liveConsumption?.watts || 0,
        solarKw: liveSolar?.kwGenerated || 0,
        netGridWatts: netGridNow,
        exporting: netGridNow < 0,
      },
      today: {
        consumptionKwh: todayConsumption,
        solarKwh: todaySolar,
        netUtilityKwh: Math.max(0, todayConsumption - todaySolar),
      },
      month: {
        consumptionKwh: monthConsumption,
        solarKwh: monthSolar,
        netUtilityKwh: Math.max(0, monthConsumption - monthSolar),
        solarOffsetPercent: monthConsumption > 0
          ? ((monthSolar / monthConsumption) * 100).toFixed(1)
          : 0,
      },
    };
  }

  // ── Solar Offset ──────────────────────────────────────────────

  async getSolarOffset(siteId, startDate, endDate) {
    const [consumption, solar] = await Promise.all([
      this._sumKwh(siteId, 'consumption', startDate, endDate),
      this._sumKwh(siteId, 'solar', startDate, endDate),
    ]);

    return {
      consumptionKwh: consumption,
      solarKwh: solar,
      offsetPercent: consumption > 0 ? ((solar / consumption) * 100).toFixed(1) : 0,
      netUtilityKwh: Math.max(0, consumption - solar),
      excessSolarKwh: Math.max(0, solar - consumption),
    };
  }

  // ── Self-Consumption Ratio ────────────────────────────────────

  async getSelfConsumptionRatio(siteId, startDate, endDate) {
    // Approximate: compare hourly solar vs consumption
    const hourlyData = await this._getHourlyComparison(siteId, startDate, endDate);

    let totalSolar = 0;
    let solarUsedDirectly = 0;

    for (const hour of hourlyData) {
      totalSolar += hour.solarKwh;
      solarUsedDirectly += Math.min(hour.solarKwh, hour.consumptionKwh);
    }

    return {
      totalSolarKwh: totalSolar,
      selfConsumedKwh: solarUsedDirectly,
      ratio: totalSolar > 0 ? ((solarUsedDirectly / totalSolar) * 100).toFixed(1) : 0,
    };
  }

  // ── Estimated Savings ─────────────────────────────────────────

  async getEstimatedSavings(siteId, startDate, endDate, ratePerKwh = 0.12) {
    const solar = await this._sumKwh(siteId, 'solar', startDate, endDate);
    const costWithoutSolar = solar * ratePerKwh;

    return {
      solarKwh: solar,
      estimatedSavings: parseFloat(costWithoutSolar.toFixed(2)),
      rateUsed: ratePerKwh,
    };
  }

  // ── Peak Demand Analysis ──────────────────────────────────────

  async getPeakDemand(siteId, startDate, endDate) {
    const peak = await prisma.consumptionData.findFirst({
      where: {
        device: { siteId, type: 'EMPORIA_VUE' },
        timestamp: { gte: startDate, lte: endDate },
      },
      orderBy: { watts: 'desc' },
    });

    return peak
      ? { peakWatts: peak.watts, peakTime: peak.timestamp, channel: peak.channel }
      : null;
  }

  // ── Historical Time-Series ────────────────────────────────────

  async getHistoricalData(siteId, startDate, endDate, resolution = 'hourly') {
    // Group by time bucket
    const bucketMinutes = resolution === 'daily' ? 1440 : resolution === 'weekly' ? 10080 : 60;

    const consumption = await prisma.$queryRawUnsafe(`
      SELECT
        date_trunc('hour', timestamp) AS bucket,
        SUM(kwh) AS total_kwh,
        AVG(watts) AS avg_watts
      FROM consumption_data
      WHERE device_id IN (
        SELECT id FROM devices WHERE site_id = $1 AND type = 'EMPORIA_VUE'
      )
      AND timestamp >= $2 AND timestamp <= $3
      GROUP BY bucket
      ORDER BY bucket
    `, siteId, startDate, endDate);

    const solar = await prisma.$queryRawUnsafe(`
      SELECT
        date_trunc('hour', timestamp) AS bucket,
        SUM(kwh_generated) AS total_kwh,
        AVG(kw_generated) AS avg_kw
      FROM solar_data
      WHERE device_id IN (
        SELECT id FROM devices WHERE site_id = $1 AND type = 'SMA_INVERTER'
      )
      AND timestamp >= $2 AND timestamp <= $3
      GROUP BY bucket
      ORDER BY bucket
    `, siteId, startDate, endDate);

    return { consumption, solar };
  }

  // ── Private Helpers ───────────────────────────────────────────

  async _latestReading(siteId, deviceType) {
    if (deviceType === 'EMPORIA_VUE') {
      return prisma.consumptionData.findFirst({
        where: { device: { siteId, type: deviceType } },
        orderBy: { timestamp: 'desc' },
      });
    }
    return prisma.solarData.findFirst({
      where: { device: { siteId, type: deviceType } },
      orderBy: { timestamp: 'desc' },
    });
  }

  async _sumKwh(siteId, dataType, startDate, endDate) {
    if (dataType === 'consumption') {
      const result = await prisma.consumptionData.aggregate({
        where: {
          device: { siteId, type: 'EMPORIA_VUE' },
          timestamp: { gte: startDate, lte: endDate },
        },
        _sum: { kwh: true },
      });
      return result._sum.kwh || 0;
    }

    const result = await prisma.solarData.aggregate({
      where: {
        device: { siteId, type: 'SMA_INVERTER' },
        timestamp: { gte: startDate, lte: endDate },
      },
      _sum: { kwhGenerated: true },
    });
    return result._sum.kwhGenerated || 0;
  }

  async _getHourlyComparison(siteId, startDate, endDate) {
    const raw = await prisma.$queryRawUnsafe(`
      WITH consumption_hourly AS (
        SELECT date_trunc('hour', timestamp) AS hour, SUM(kwh) AS kwh
        FROM consumption_data
        WHERE device_id IN (SELECT id FROM devices WHERE site_id = $1 AND type = 'EMPORIA_VUE')
          AND timestamp >= $2 AND timestamp <= $3
        GROUP BY hour
      ),
      solar_hourly AS (
        SELECT date_trunc('hour', timestamp) AS hour, SUM(kwh_generated) AS kwh
        FROM solar_data
        WHERE device_id IN (SELECT id FROM devices WHERE site_id = $1 AND type = 'SMA_INVERTER')
          AND timestamp >= $2 AND timestamp <= $3
        GROUP BY hour
      )
      SELECT
        COALESCE(c.hour, s.hour) AS hour,
        COALESCE(c.kwh, 0) AS consumption_kwh,
        COALESCE(s.kwh, 0) AS solar_kwh
      FROM consumption_hourly c
      FULL OUTER JOIN solar_hourly s ON c.hour = s.hour
      ORDER BY hour
    `, siteId, startDate, endDate);

    return raw.map((r) => ({
      hour: r.hour,
      consumptionKwh: parseFloat(r.consumption_kwh),
      solarKwh: parseFloat(r.solar_kwh),
    }));
  }
}

module.exports = new AnalyticsService();
