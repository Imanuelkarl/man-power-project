/*
  Warnings:

  - A unique constraint covering the columns `[manId]` on the table `Manufacturer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[data_id]` on the table `PowerData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `manId` to the `Manufacturer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_id` to the `PowerData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PowerData" DROP CONSTRAINT "PowerData_manufacturer_id_fkey";

-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "manId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PowerData" ADD COLUMN     "data_id" TEXT NOT NULL,
ALTER COLUMN "manufacturer_id" SET DATA TYPE TEXT,
ALTER COLUMN "submitted_by" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_manId_key" ON "Manufacturer"("manId");

-- CreateIndex
CREATE UNIQUE INDEX "PowerData_data_id_key" ON "PowerData"("data_id");

-- AddForeignKey
ALTER TABLE "PowerData" ADD CONSTRAINT "PowerData_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "Manufacturer"("manId") ON DELETE CASCADE ON UPDATE CASCADE;
