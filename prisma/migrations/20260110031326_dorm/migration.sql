/*
  Warnings:

  - You are about to drop the column `studentUniversityId` on the `exit` table. All the data in the column will be lost.
  - You are about to drop the column `blockId` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DormStatus" AS ENUM ('FREE', 'OCCUPIED', 'UNUSABLE', 'MAINTENANCE');

-- DropForeignKey
ALTER TABLE "exit" DROP CONSTRAINT "exit_studentUniversityId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_blockId_fkey";

-- DropIndex
DROP INDEX "exit_id_studentId_proctorId_gateUserId_studentUniversityId_idx";

-- AlterTable
ALTER TABLE "exit" DROP COLUMN "studentUniversityId";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "blockId";

-- CreateTable
CREATE TABLE "dormitory" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "DormStatus" NOT NULL DEFAULT 'FREE',
    "blockId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dormitory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_dormitory" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "dormId" TEXT NOT NULL,
    "vaildUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_dormitory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dormitory_id_number_idx" ON "dormitory"("id", "number");

-- CreateIndex
CREATE INDEX "user_dormitory_userId_isActive_idx" ON "user_dormitory"("userId", "isActive");

-- CreateIndex
CREATE INDEX "exit_id_studentId_proctorId_gateUserId_idx" ON "exit"("id", "studentId", "proctorId", "gateUserId");

-- AddForeignKey
ALTER TABLE "dormitory" ADD CONSTRAINT "dormitory_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_dormitory" ADD CONSTRAINT "user_dormitory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_dormitory" ADD CONSTRAINT "user_dormitory_dormId_fkey" FOREIGN KEY ("dormId") REFERENCES "dormitory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
