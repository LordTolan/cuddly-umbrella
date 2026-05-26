const fs = require('fs');
const pdfParse = require('pdf-parse');
const { parse: csvParse } = require('csv-parse/sync');
const prisma = require('../config/database');
const logger = require('../config/logger');

/**
 * Duke Energy billing service.
 *
 * Phase 1: Manual PDF/CSV upload → parse → store
 * Phase 2: Green Button XML support
 */
class BillingService {
  // ── PDF Parsing ───────────────────────────────────────────────

  async parsePdfBill(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = data.text;

    // Extract key fields via regex (Duke Energy bill format)
    const totalKwh = this._extractNumber(text, /total\s*kwh\s*[:\-]?\s*([\d,.]+)/i);
    const totalCost = this._extractNumber(text, /total\s*(?:amount|due|charges?)\s*[:\-]?\s*\$?([\d,.]+)/i);
    const periodMatch = text.match(
      /(?:billing|service)\s*period\s*[:\-]?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*(?:to|[-–])\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i
    );

    const periodStart = periodMatch ? new Date(periodMatch[1]) : null;
    const periodEnd = periodMatch ? new Date(periodMatch[2]) : null;

    // TOU breakdown (optional)
    const peakKwh = this._extractNumber(text, /peak\s*kwh\s*[:\-]?\s*([\d,.]+)/i);
    const offPeakKwh = this._extractNumber(text, /off[\s-]*peak\s*kwh\s*[:\-]?\s*([\d,.]+)/i);
    const demandKw = this._extractNumber(text, /demand\s*kw?\s*[:\-]?\s*([\d,.]+)/i);

    return {
      totalKwh,
      totalCost,
      periodStart,
      periodEnd,
      peakKwh,
      offPeakKwh,
      demandKw,
      rawText: text,
    };
  }

  // ── CSV Parsing ───────────────────────────────────────────────

  parseCsvBill(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = csvParse(content, { columns: true, skip_empty_lines: true });

    // Aggregate from interval data
    let totalKwh = 0;
    let peakKwh = 0;
    let offPeakKwh = 0;

    for (const row of records) {
      const kwh = parseFloat(row.kwh || row.kWh || row.usage || 0);
      totalKwh += kwh;

      if (row.rate_type?.toLowerCase().includes('peak')) {
        peakKwh += kwh;
      } else {
        offPeakKwh += kwh;
      }
    }

    return {
      totalKwh,
      peakKwh: peakKwh || null,
      offPeakKwh: offPeakKwh || null,
      records,
    };
  }

  // ── Store Bill ────────────────────────────────────────────────

  async storeBill(siteId, parsedData, sourceFile) {
    const bill = await prisma.utilityBill.create({
      data: {
        siteId,
        periodStart: parsedData.periodStart || new Date(),
        periodEnd: parsedData.periodEnd || new Date(),
        totalKwh: parsedData.totalKwh || 0,
        totalCost: parsedData.totalCost || 0,
        peakKwh: parsedData.peakKwh,
        offPeakKwh: parsedData.offPeakKwh,
        demandKw: parsedData.demandKw,
        sourceFile,
        rawData: parsedData.rawText ? { text: parsedData.rawText } : null,
      },
    });

    logger.info(`Stored bill for site ${siteId}: ${bill.totalKwh} kWh, $${bill.totalCost}`);
    return bill;
  }

  // ── Billing Validation ────────────────────────────────────────

  async validateBill(billId) {
    const bill = await prisma.utilityBill.findUnique({
      where: { id: billId },
      include: { site: { include: { devices: true } } },
    });

    if (!bill) throw new Error('Bill not found');

    // Get consumption data for the billing period
    const consumption = await prisma.consumptionData.aggregate({
      where: {
        device: { siteId: bill.siteId, type: 'EMPORIA_VUE' },
        timestamp: { gte: bill.periodStart, lte: bill.periodEnd },
      },
      _sum: { kwh: true },
    });

    // Get solar production for the billing period
    const solar = await prisma.solarData.aggregate({
      where: {
        device: { siteId: bill.siteId, type: 'SMA_INVERTER' },
        timestamp: { gte: bill.periodStart, lte: bill.periodEnd },
      },
      _sum: { kwhGenerated: true },
    });

    const measuredConsumption = consumption._sum.kwh || 0;
    const measuredSolar = solar._sum.kwhGenerated || 0;
    const expectedUtilityUsage = Math.max(0, measuredConsumption - measuredSolar);
    const billedUsage = bill.totalKwh;
    const discrepancy = billedUsage - expectedUtilityUsage;
    const discrepancyPct = expectedUtilityUsage > 0
      ? ((discrepancy / expectedUtilityUsage) * 100).toFixed(1)
      : null;

    return {
      billId,
      periodStart: bill.periodStart,
      periodEnd: bill.periodEnd,
      billedKwh: billedUsage,
      measuredConsumptionKwh: measuredConsumption,
      solarProductionKwh: measuredSolar,
      expectedUtilityKwh: expectedUtilityUsage,
      discrepancyKwh: discrepancy,
      discrepancyPercent: discrepancyPct,
      status: Math.abs(discrepancy) < billedUsage * 0.05 ? 'MATCH' : 'DISCREPANCY',
    };
  }

  // ── Helpers ───────────────────────────────────────────────────

  _extractNumber(text, regex) {
    const match = text.match(regex);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  }
}

module.exports = new BillingService();
