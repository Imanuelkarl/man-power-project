-- AlterTable
ALTER TABLE "PowerData" ADD COLUMN     "diesel_energy_generated" DOUBLE PRECISION,
ADD COLUMN     "gas_energy_generated" DOUBLE PRECISION,
ADD COLUMN     "generator_energy_generated" DOUBLE PRECISION,
ADD COLUMN     "other_energy_generated" DOUBLE PRECISION,
ADD COLUMN     "total_energy_consumed" DOUBLE PRECISION,
ADD COLUMN     "total_energy_generated" DOUBLE PRECISION;
