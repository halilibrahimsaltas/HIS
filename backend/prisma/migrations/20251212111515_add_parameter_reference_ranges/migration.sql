-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('CHILD', 'ADULT', 'ELDERLY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'BOTH');

-- CreateTable
CREATE TABLE "ParameterReferenceRange" (
    "id" SERIAL NOT NULL,
    "testParameterId" INTEGER NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "gender" "Gender" NOT NULL,
    "rangeText" TEXT,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParameterReferenceRange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParameterReferenceRange_testParameterId_idx" ON "ParameterReferenceRange"("testParameterId");

-- CreateIndex
CREATE UNIQUE INDEX "ParameterReferenceRange_testParameterId_ageGroup_gender_key" ON "ParameterReferenceRange"("testParameterId", "ageGroup", "gender");

-- AddForeignKey
ALTER TABLE "ParameterReferenceRange" ADD CONSTRAINT "ParameterReferenceRange_testParameterId_fkey" FOREIGN KEY ("testParameterId") REFERENCES "TestParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
