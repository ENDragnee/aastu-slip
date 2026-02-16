/*
  Warnings:

  - A unique constraint covering the columns `[serialNumber]` on the table `laptop` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "laptop_serialNumber_key" ON "laptop"("serialNumber");
