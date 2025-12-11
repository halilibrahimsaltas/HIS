-- CreateTable
CREATE TABLE "OrderTestParameter" (
    "id" SERIAL NOT NULL,
    "orderTestId" INTEGER NOT NULL,
    "testParameterId" INTEGER NOT NULL,

    CONSTRAINT "OrderTestParameter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderTestParameter_orderTestId_testParameterId_key" ON "OrderTestParameter"("orderTestId", "testParameterId");

-- AddForeignKey
ALTER TABLE "OrderTestParameter" ADD CONSTRAINT "OrderTestParameter_orderTestId_fkey" FOREIGN KEY ("orderTestId") REFERENCES "OrderTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTestParameter" ADD CONSTRAINT "OrderTestParameter_testParameterId_fkey" FOREIGN KEY ("testParameterId") REFERENCES "TestParameter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
