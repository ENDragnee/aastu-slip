/*
  Warnings:

  - You are about to drop the column `exitId` on the `laptop` table. All the data in the column will be lost.
  - You are about to drop the `exit_propery` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "exit_propery" DROP CONSTRAINT "exit_propery_exitId_fkey";

-- DropForeignKey
ALTER TABLE "exit_propery" DROP CONSTRAINT "exit_propery_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "laptop" DROP CONSTRAINT "laptop_exitId_fkey";

-- DropIndex
DROP INDEX "laptop_studentUniversityId_serialNumber_exitId_idx";

-- AlterTable
ALTER TABLE "laptop" DROP COLUMN "exitId";

-- DropTable
DROP TABLE "exit_propery";

-- CreateTable
CREATE TABLE "exit_property" (
    "exitId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "exit_property_pkey" PRIMARY KEY ("exitId","propertyId")
);

-- CreateTable
CREATE TABLE "laptop_exit" (
    "laptopId" TEXT NOT NULL,
    "exitId" TEXT NOT NULL,

    CONSTRAINT "laptop_exit_pkey" PRIMARY KEY ("exitId","laptopId")
);

-- CreateIndex
CREATE INDEX "laptop_studentUniversityId_serialNumber_idx" ON "laptop"("studentUniversityId", "serialNumber");

-- AddForeignKey
ALTER TABLE "exit_property" ADD CONSTRAINT "exit_property_exitId_fkey" FOREIGN KEY ("exitId") REFERENCES "exit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_property" ADD CONSTRAINT "exit_property_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laptop_exit" ADD CONSTRAINT "laptop_exit_exitId_fkey" FOREIGN KEY ("exitId") REFERENCES "exit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laptop_exit" ADD CONSTRAINT "laptop_exit_laptopId_fkey" FOREIGN KEY ("laptopId") REFERENCES "laptop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
