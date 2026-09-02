/*
  Warnings:

  - A unique constraint covering the columns `[manufacturerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "manufacturerId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_manufacturerId_key" ON "User"("manufacturerId");
