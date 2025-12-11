/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PENDING', 'ENTERED', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "acceptedBy" INTEGER,
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "sampleStatus" "SampleStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderTestParameter" ADD COLUMN     "enteredAt" TIMESTAMP(3),
ADD COLUMN     "enteredBy" INTEGER,
ADD COLUMN     "result" TEXT,
ADD COLUMN     "status" "ResultStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "Order_barcode_key" ON "Order"("barcode");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTestParameter" ADD CONSTRAINT "OrderTestParameter_enteredBy_fkey" FOREIGN KEY ("enteredBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
