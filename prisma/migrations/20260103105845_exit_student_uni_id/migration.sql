/*
  Warnings:

  - A unique constraint covering the columns `[exitCode]` on the table `exit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `exitCode` to the `exit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentUniversityId` to the `exit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "exit_id_studentId_proctorId_gateUserId_idx";

-- DropIndex
DROP INDEX "user_id_name_role_idx";

-- AlterTable
ALTER TABLE "exit" ADD COLUMN     "exitCode" TEXT NOT NULL,
ADD COLUMN     "studentUniversityId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "exit_exitCode_key" ON "exit"("exitCode");

-- CreateIndex
CREATE INDEX "exit_id_studentId_proctorId_gateUserId_studentUniversityId_idx" ON "exit"("id", "studentId", "proctorId", "gateUserId", "studentUniversityId");

-- CreateIndex
CREATE INDEX "user_id_name_role_universityId_idx" ON "user"("id", "name", "role", "universityId");

-- AddForeignKey
ALTER TABLE "exit" ADD CONSTRAINT "exit_studentUniversityId_fkey" FOREIGN KEY ("studentUniversityId") REFERENCES "user"("universityId") ON DELETE RESTRICT ON UPDATE CASCADE;
