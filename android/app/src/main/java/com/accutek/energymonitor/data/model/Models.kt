package com.accutek.energymonitor.data.model

import com.google.gson.annotations.SerializedName

// ─── Auth ────────────────────────────────────────────────────────

data class User(
    val id: String,
    val email: String,
    val name: String?,
    val sites: List<Site> = emptyList()
)

data class AuthResponse(val user: User)

// ─── Sites ───────────────────────────────────────────────────────

data class Site(
    val id: String,
    val name: String,
    val address: String?,
    @SerializedName("utility_provider") val utilityProvider: String,
    val devices: List<Device> = emptyList()
)

data class SitesResponse(val sites: List<Site>)

// ─── Devices ─────────────────────────────────────────────────────

data class Device(
    val id: String,
    val name: String,
    val type: String,
    @SerializedName("serial_number") val serialNumber: String?,
    @SerializedName("is_active") val isActive: Boolean,
    @SerializedName("last_sync_at") val lastSyncAt: String?
)

data class ConnectDeviceRequest(
    val siteId: String,
    val type: String,
    val credentials: Map<String, String>
)

// ─── Dashboard / Energy ──────────────────────────────────────────

data class DashboardSummary(
    val live: LiveData,
    val today: PeriodData,
    val month: MonthData
)

data class LiveData(
    @SerializedName("consumptionWatts") val consumptionWatts: Double,
    @SerializedName("solarKw") val solarKw: Double,
    @SerializedName("netGridWatts") val netGridWatts: Double,
    val exporting: Boolean
)

data class PeriodData(
    @SerializedName("consumptionKwh") val consumptionKwh: Double,
    @SerializedName("solarKwh") val solarKwh: Double,
    @SerializedName("netUtilityKwh") val netUtilityKwh: Double
)

data class MonthData(
    @SerializedName("consumptionKwh") val consumptionKwh: Double,
    @SerializedName("solarKwh") val solarKwh: Double,
    @SerializedName("netUtilityKwh") val netUtilityKwh: Double,
    @SerializedName("solarOffsetPercent") val solarOffsetPercent: Double
)

// ─── Solar ───────────────────────────────────────────────────────

data class SolarLive(
    val current: SolarCurrent,
    val today: SolarPeriod,
    val month: SolarPeriod
)

data class SolarCurrent(
    val kw: Double,
    val status: String,
    val lastUpdate: String?
)

data class SolarPeriod(
    @SerializedName("kwhGenerated") val kwhGenerated: Double
)

data class SolarOffset(
    @SerializedName("consumptionKwh") val consumptionKwh: Double,
    @SerializedName("solarKwh") val solarKwh: Double,
    @SerializedName("offsetPercent") val offsetPercent: Double,
    @SerializedName("netUtilityKwh") val netUtilityKwh: Double,
    @SerializedName("excessSolarKwh") val excessSolarKwh: Double
)

// ─── Billing ─────────────────────────────────────────────────────

data class UtilityBill(
    val id: String,
    @SerializedName("period_start") val periodStart: String,
    @SerializedName("period_end") val periodEnd: String,
    @SerializedName("total_kwh") val totalKwh: Double,
    @SerializedName("total_cost") val totalCost: Double
)

data class BillsResponse(val bills: List<UtilityBill>)

data class BillValidation(
    @SerializedName("billedKwh") val billedKwh: Double,
    @SerializedName("measuredConsumptionKwh") val measuredConsumptionKwh: Double,
    @SerializedName("solarProductionKwh") val solarProductionKwh: Double,
    @SerializedName("expectedUtilityKwh") val expectedUtilityKwh: Double,
    @SerializedName("discrepancyKwh") val discrepancyKwh: Double,
    @SerializedName("discrepancyPercent") val discrepancyPercent: Double?,
    val status: String
)

// ─── Alerts ──────────────────────────────────────────────────────

data class Alert(
    val id: String,
    val type: String,
    val severity: String,
    val title: String,
    val message: String,
    @SerializedName("read_at") val readAt: String?,
    @SerializedName("created_at") val createdAt: String
)

data class AlertsResponse(val alerts: List<Alert>)
