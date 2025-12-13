/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `OrderTest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DeviceResultQueue" ADD COLUMN     "orderTestId" INTEGER,
ALTER COLUMN "testCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderTest" ADD COLUMN     "barcode" TEXT;

-- CreateIndex
CREATE INDEX "DeviceResultQueue_orderTestId_idx" ON "DeviceResultQueue"("orderTestId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderTest_barcode_key" ON "OrderTest"("barcode");

-- AddForeignKey
ALTER TABLE "DeviceResultQueue" ADD CONSTRAINT "DeviceResultQueue_orderTestId_fkey" FOREIGN KEY ("orderTestId") REFERENCES "OrderTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
