/*
  Warnings:

  - The values [VERIFIED] on the enum `ResultStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ResultStatus_new" AS ENUM ('PENDING', 'ENTERED', 'REJECTED');
ALTER TABLE "OrderTestParameter" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "OrderTestParameter" ALTER COLUMN "status" TYPE "ResultStatus_new" USING ("status"::text::"ResultStatus_new");
ALTER TYPE "ResultStatus" RENAME TO "ResultStatus_old";
ALTER TYPE "ResultStatus_new" RENAME TO "ResultStatus";
DROP TYPE "ResultStatus_old";
ALTER TABLE "OrderTestParameter" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CHIEF_PHYSICIAN';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "branchId" INTEGER,
ADD COLUMN     "discountExplanation" TEXT,
ADD COLUMN     "discountPercentage" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "branchId" INTEGER;

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE INDEX "Branch_code_idx" ON "Branch"("code");

-- CreateIndex
CREATE INDEX "Order_branchId_idx" ON "Order"("branchId");

-- CreateIndex
CREATE INDEX "User_branchId_idx" ON "User"("branchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
