-- CreateEnum
CREATE TYPE "DeviceProtocol" AS ENUM ('ASTM', 'HL7', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('TCP_IP', 'SERIAL', 'FILE');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'ERROR', 'MANUAL_REVIEW');

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT,
    "protocol" "DeviceProtocol" NOT NULL DEFAULT 'ASTM',
    "connectionType" "ConnectionType" NOT NULL DEFAULT 'TCP_IP',
    "host" TEXT,
    "port" INTEGER,
    "serialPort" TEXT,
    "baudRate" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastConnected" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceTestMapping" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "deviceTestCode" TEXT NOT NULL,
    "testParameterId" INTEGER NOT NULL,

    CONSTRAINT "DeviceTestMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceResultQueue" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "rawMessage" TEXT NOT NULL,
    "parsedData" JSONB,
    "patientId" INTEGER,
    "orderId" INTEGER,
    "barcode" TEXT,
    "testCode" TEXT NOT NULL,
    "result" TEXT,
    "unit" TEXT,
    "status" "QueueStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceResultQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_serialNumber_key" ON "Device"("serialNumber");

-- CreateIndex
CREATE INDEX "DeviceTestMapping_deviceId_idx" ON "DeviceTestMapping"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceTestMapping_testParameterId_idx" ON "DeviceTestMapping"("testParameterId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceTestMapping_deviceId_deviceTestCode_key" ON "DeviceTestMapping"("deviceId", "deviceTestCode");

-- CreateIndex
CREATE INDEX "DeviceResultQueue_deviceId_idx" ON "DeviceResultQueue"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceResultQueue_status_idx" ON "DeviceResultQueue"("status");

-- CreateIndex
CREATE INDEX "DeviceResultQueue_barcode_idx" ON "DeviceResultQueue"("barcode");

-- CreateIndex
CREATE INDEX "DeviceResultQueue_createdAt_idx" ON "DeviceResultQueue"("createdAt");

-- AddForeignKey
ALTER TABLE "DeviceTestMapping" ADD CONSTRAINT "DeviceTestMapping_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceTestMapping" ADD CONSTRAINT "DeviceTestMapping_testParameterId_fkey" FOREIGN KEY ("testParameterId") REFERENCES "TestParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceResultQueue" ADD CONSTRAINT "DeviceResultQueue_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceResultQueue" ADD CONSTRAINT "DeviceResultQueue_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceResultQueue" ADD CONSTRAINT "DeviceResultQueue_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
