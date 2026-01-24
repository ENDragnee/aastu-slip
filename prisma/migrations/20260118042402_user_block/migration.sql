-- DropIndex
DROP INDEX "dormitory_id_number_idx";

-- DropIndex
DROP INDEX "user_dormitory_userId_isActive_idx";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "blockId" TEXT;

-- CreateIndex
CREATE INDEX "dormitory_id_number_blockId_idx" ON "dormitory"("id", "number", "blockId");

-- CreateIndex
CREATE INDEX "user_dormitory_userId_isActive_dormId_idx" ON "user_dormitory"("userId", "isActive", "dormId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "block"("id") ON DELETE SET NULL ON UPDATE CASCADE;
