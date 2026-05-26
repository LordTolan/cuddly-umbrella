package com.accutek.energymonitor.data.api

import com.accutek.energymonitor.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.*

interface EnergyApi {

    // ── Auth ─────────────────────────────────────────────────────
    @POST("auth/register")
    suspend fun register(): AuthResponse

    @POST("auth/login")
    suspend fun login(): AuthResponse

    @GET("auth/me")
    suspend fun getMe(): AuthResponse

    // ── Sites ────────────────────────────────────────────────────
    @GET("sites")
    suspend fun getSites(): SitesResponse

    @POST("sites")
    suspend fun createSite(@Body body: Map<String, String>): Map<String, Site>

    // ── Devices ──────────────────────────────────────────────────
    @GET("devices")
    suspend fun getDevices(): Map<String, List<Device>>

    @POST("devices/connect")
    suspend fun connectDevice(@Body body: ConnectDeviceRequest): Map<String, Device>

    @DELETE("devices/{id}")
    suspend fun deleteDevice(@Path("id") id: String): Map<String, Boolean>

    // ── Energy / Dashboard ───────────────────────────────────────
    @GET("energy/live")
    suspend fun getLiveEnergy(@Query("siteId") siteId: String): DashboardSummary

    @GET("energy/history")
    suspend fun getEnergyHistory(
        @Query("siteId") siteId: String,
        @Query("start") start: String,
        @Query("end") end: String,
        @Query("resolution") resolution: String = "hourly"
    ): Map<String, Any>

    @GET("energy/offset")
    suspend fun getSolarOffset(
        @Query("siteId") siteId: String,
        @Query("start") start: String? = null,
        @Query("end") end: String? = null
    ): SolarOffset

    @GET("energy/savings")
    suspend fun getEstimatedSavings(
        @Query("siteId") siteId: String,
        @Query("start") start: String? = null,
        @Query("end") end: String? = null,
        @Query("rate") rate: Double? = null
    ): Map<String, Any>

    // ── Solar ────────────────────────────────────────────────────
    @GET("solar/live")
    suspend fun getSolarLive(@Query("siteId") siteId: String): SolarLive

    @GET("solar/history")
    suspend fun getSolarHistory(
        @Query("siteId") siteId: String,
        @Query("start") start: String,
        @Query("end") end: String,
        @Query("resolution") resolution: String = "hourly"
    ): Map<String, Any>

    // ── Billing ──────────────────────────────────────────────────
    @Multipart
    @POST("billing/upload")
    suspend fun uploadBill(
        @Part("siteId") siteId: RequestBody,
        @Part bill: MultipartBody.Part
    ): Map<String, Any>

    @GET("billing/analysis")
    suspend fun getBillAnalysis(@Query("billId") billId: String): BillValidation

    @GET("billing/history")
    suspend fun getBillHistory(@Query("siteId") siteId: String): BillsResponse

    // ── Alerts ───────────────────────────────────────────────────
    @GET("alerts")
    suspend fun getAlerts(
        @Query("siteId") siteId: String,
        @Query("unreadOnly") unreadOnly: Boolean = false
    ): AlertsResponse

    @PATCH("alerts/{id}/read")
    suspend fun markAlertRead(@Path("id") id: String): Map<String, Alert>
}
