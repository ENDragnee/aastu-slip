/*
  Warnings:

  - You are about to drop the column `vaildUntil` on the `user_dormitory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_dormitory" DROP COLUMN "vaildUntil",
ADD COLUMN     "validUntil" TIMESTAMP(3);
