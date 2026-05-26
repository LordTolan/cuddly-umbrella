package com.accutek.energymonitor.data.repository

import com.accutek.energymonitor.data.api.EnergyApi
import com.accutek.energymonitor.data.model.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import javax.inject.Inject

class EnergyRepository @Inject constructor(
    private val api: EnergyApi
) {
    // ── Auth ─────────────────────────────────────────────────────
    suspend fun register(): User = api.register().user
    suspend fun login(): User = api.login().user
    suspend fun getMe(): User = api.getMe().user

    // ── Sites ────────────────────────────────────────────────────
    suspend fun getSites(): List<Site> = api.getSites().sites

    suspend fun createSite(name: String, address: String? = null): Site {
        val body = mutableMapOf("name" to name)
        address?.let { body["address"] = it }
        return api.createSite(body)["site"]!!
    }

    // ── Devices ──────────────────────────────────────────────────
    suspend fun connectDevice(siteId: String, type: String, credentials: Map<String, String>): Device {
        return api.connectDevice(ConnectDeviceRequest(siteId, type, credentials))["device"]!!
    }

    // ── Dashboard ────────────────────────────────────────────────
    suspend fun getLiveDashboard(siteId: String): DashboardSummary = api.getLiveEnergy(siteId)

    // ── Solar ────────────────────────────────────────────────────
    suspend fun getSolarLive(siteId: String): SolarLive = api.getSolarLive(siteId)

    suspend fun getSolarOffset(siteId: String, start: String? = null, end: String? = null): SolarOffset =
        api.getSolarOffset(siteId, start, end)

    // ── Billing ──────────────────────────────────────────────────
    suspend fun uploadBill(siteId: String, file: File): Map<String, Any> {
        val siteIdBody = siteId.toRequestBody("text/plain".toMediaTypeOrNull())
        val filePart = MultipartBody.Part.createFormData(
            "bill",
            file.name,
            file.asRequestBody("application/octet-stream".toMediaTypeOrNull())
        )
        return api.uploadBill(siteIdBody, filePart)
    }

    suspend fun getBillHistory(siteId: String): List<UtilityBill> = api.getBillHistory(siteId).bills

    suspend fun getBillAnalysis(billId: String): BillValidation = api.getBillAnalysis(billId)

    // ── Alerts ───────────────────────────────────────────────────
    suspend fun getAlerts(siteId: String, unreadOnly: Boolean = false): List<Alert> =
        api.getAlerts(siteId, unreadOnly).alerts
}
