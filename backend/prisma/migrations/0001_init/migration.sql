-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('EMPORIA_VUE', 'SMA_INVERTER');
CREATE TYPE "AlertType" AS ENUM ('SOLAR_OFFLINE', 'SOLAR_UNDERPERFORMANCE', 'BILLING_SPIKE', 'EXCESSIVE_PEAK', 'PHANTOM_LOAD', 'HIGH_BASELOAD');
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "utility_provider" TEXT NOT NULL DEFAULT 'Duke Energy',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT,
    "api_token" TEXT,
    "api_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "consumption_data" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "watts" DOUBLE PRECISION NOT NULL,
    "kwh" DOUBLE PRECISION NOT NULL,
    "channel" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "consumption_data_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "solar_data" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "kw_generated" DOUBLE PRECISION NOT NULL,
    "kwh_generated" DOUBLE PRECISION NOT NULL,
    "inverter_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "solar_data_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "utility_bills" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_kwh" DOUBLE PRECISION NOT NULL,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "peak_kwh" DOUBLE PRECISION,
    "off_peak_kwh" DOUBLE PRECISION,
    "demand_kw" DOUBLE PRECISION,
    "source_file" TEXT,
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "utility_bills_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "consumption_data_device_id_timestamp_idx" ON "consumption_data"("device_id", "timestamp");
CREATE INDEX "consumption_data_timestamp_idx" ON "consumption_data"("timestamp");
CREATE INDEX "solar_data_device_id_timestamp_idx" ON "solar_data"("device_id", "timestamp");
CREATE INDEX "solar_data_timestamp_idx" ON "solar_data"("timestamp");
CREATE INDEX "utility_bills_site_id_period_start_idx" ON "utility_bills"("site_id", "period_start");
CREATE INDEX "alerts_site_id_created_at_idx" ON "alerts"("site_id", "created_at");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "devices" ADD CONSTRAINT "devices_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consumption_data" ADD CONSTRAINT "consumption_data_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "solar_data" ADD CONSTRAINT "solar_data_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "utility_bills" ADD CONSTRAINT "utility_bills_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
