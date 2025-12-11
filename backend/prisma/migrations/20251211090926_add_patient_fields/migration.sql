/*
  Warnings:

  - Added the required column `birthDate` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "identityNumber" TEXT;
