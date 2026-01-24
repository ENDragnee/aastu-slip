/*
  Warnings:

  - You are about to drop the column `studentUniversityId` on the `laptop` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "laptop" DROP CONSTRAINT "laptop_studentUniversityId_fkey";

-- DropIndex
DROP INDEX "laptop_studentUniversityId_serialNumber_idx";

-- AlterTable
ALTER TABLE "laptop" DROP COLUMN "studentUniversityId",
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "laptop_serialNumber_idx" ON "laptop"("serialNumber");

-- AddForeignKey
ALTER TABLE "laptop" ADD CONSTRAINT "laptop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
