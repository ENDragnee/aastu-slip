/*
  Warnings:

  - Added the required column `quantity` to the `exit_property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "exit_property" ADD COLUMN     "quantity" INTEGER NOT NULL;
