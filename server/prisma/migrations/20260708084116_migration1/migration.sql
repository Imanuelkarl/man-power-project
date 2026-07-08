-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'manufacturer', 'investor');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('draft', 'submitted');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'manufacturer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "sectoral_group" TEXT,
    "sub_sector" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "registration_number" TEXT,
    "year_established" INTEGER,
    "employee_count" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PowerData" (
    "id" SERIAL NOT NULL,
    "manufacturer_id" INTEGER NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'H1-2026',
    "capacity_utilization" DOUBLE PRECISION,
    "production_value" DOUBLE PRECISION,
    "raw_material_cost" DOUBLE PRECISION,
    "transport_cost" DOUBLE PRECISION,
    "local_sourcing_percent" DOUBLE PRECISION,
    "unsold_goods_value" DOUBLE PRECISION,
    "new_workers_employed" INTEGER,
    "total_workers" INTEGER,
    "workers_left" INTEGER,
    "avg_interest_rate" DOUBLE PRECISION,
    "avg_exchange_rate" DOUBLE PRECISION,
    "investment_land_buildings" DOUBLE PRECISION,
    "investment_plant_machinery" DOUBLE PRECISION,
    "investment_furniture" DOUBLE PRECISION,
    "investment_motor_vehicles" DOUBLE PRECISION,
    "investment_assets_in_progress" DOUBLE PRECISION,
    "avg_grid_hours" DOUBLE PRECISION,
    "avg_power_outages" DOUBLE PRECISION,
    "energy_diesel_cost" DOUBLE PRECISION,
    "energy_gas_cost" DOUBLE PRECISION,
    "energy_gen_maintenance_cost" DOUBLE PRECISION,
    "energy_other_cost" DOUBLE PRECISION,
    "energy_other_source" TEXT,
    "nigeria_first_policy_comment" TEXT,
    "additional_comments" TEXT,
    "status" "ResponseStatus" NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(3),
    "submitted_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PowerData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "PowerData" ADD CONSTRAINT "PowerData_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
