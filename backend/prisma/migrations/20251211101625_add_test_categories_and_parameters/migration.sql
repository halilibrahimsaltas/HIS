/*
  Warnings:

  - Added the required column `category` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestCategory" AS ENUM ('BIO', 'HEM', 'URI', 'HOR', 'COA', 'PCR', 'A1C', 'ESR', 'SER', 'IMM', 'MIC', 'VIT', 'TOX', 'OTHER');

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "category" "TestCategory" NOT NULL;

-- CreateTable
CREATE TABLE "TestParameter" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "referenceRange" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TestToTestParameter" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TestParameter_code_key" ON "TestParameter"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_TestToTestParameter_AB_unique" ON "_TestToTestParameter"("A", "B");

-- CreateIndex
CREATE INDEX "_TestToTestParameter_B_index" ON "_TestToTestParameter"("B");

-- AddForeignKey
ALTER TABLE "_TestToTestParameter" ADD CONSTRAINT "_TestToTestParameter_A_fkey" FOREIGN KEY ("A") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestToTestParameter" ADD CONSTRAINT "_TestToTestParameter_B_fkey" FOREIGN KEY ("B") REFERENCES "TestParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
