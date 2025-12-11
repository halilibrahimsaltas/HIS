/*
  Warnings:

  - Added the required column `fatherName` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "passportNumber" TEXT;
