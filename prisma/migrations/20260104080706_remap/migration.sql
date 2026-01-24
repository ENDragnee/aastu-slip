/*
  Warnings:

  - You are about to drop the `ExitProperty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Laptop` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Property` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExitProperty" DROP CONSTRAINT "ExitProperty_exitId_fkey";

-- DropForeignKey
ALTER TABLE "ExitProperty" DROP CONSTRAINT "ExitProperty_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Laptop" DROP CONSTRAINT "Laptop_exitId_fkey";

-- DropForeignKey
ALTER TABLE "Laptop" DROP CONSTRAINT "Laptop_studentUniversityId_fkey";

-- DropTable
DROP TABLE "ExitProperty";

-- DropTable
DROP TABLE "Laptop";

-- DropTable
DROP TABLE "Property";

-- CreateTable
CREATE TABLE "laptop" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "studentUniversityId" TEXT,
    "exitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laptop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exit_propery" (
    "exitId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "exit_propery_pkey" PRIMARY KEY ("exitId","propertyId")
);

-- CreateIndex
CREATE INDEX "laptop_studentUniversityId_serialNumber_exitId_idx" ON "laptop"("studentUniversityId", "serialNumber", "exitId");

-- CreateIndex
CREATE INDEX "property_name_idx" ON "property"("name");

-- AddForeignKey
ALTER TABLE "laptop" ADD CONSTRAINT "laptop_studentUniversityId_fkey" FOREIGN KEY ("studentUniversityId") REFERENCES "user"("universityId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laptop" ADD CONSTRAINT "laptop_exitId_fkey" FOREIGN KEY ("exitId") REFERENCES "exit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_propery" ADD CONSTRAINT "exit_propery_exitId_fkey" FOREIGN KEY ("exitId") REFERENCES "exit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_propery" ADD CONSTRAINT "exit_propery_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
