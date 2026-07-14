import { PowerData } from '../generated/prisma/client.js';
import prisma from '../services/prisma.service.js';

export type CreatePowerDataInput = {
  manufacturer_id: number;
  period?: string;
  startTime: Date;
  endTime: Date;
  capacity_utilization?: number | null;
  production_value?: number | null;
  raw_material_cost?: number | null;
  transport_cost?: number | null;
  local_sourcing_percent?: number | null;
  unsold_goods_value?: number | null;
  new_workers_employed?: number | null;
  total_workers?: number | null;
  workers_left?: number | null;
  avg_interest_rate?: number | null;
  avg_exchange_rate?: number | null;
  investment_land_buildings?: number | null;
  investment_plant_machinery?: number | null;
  investment_furniture?: number | null;
  investment_motor_vehicles?: number | null;
  investment_assets_in_progress?: number | null;
  avg_grid_hours?: number | null;
  avg_power_outages?: number | null;
  energy_diesel_cost?: number | null;
  energy_gas_cost?: number | null;
  energy_gen_maintenance_cost?: number | null;
  energy_other_cost?: number | null;
  energy_other_source?: string | null;
  nigeria_first_policy_comment?: string | null;
  additional_comments?: string | null;
  status?: 'draft' | 'submitted';
  submitted_at?: Date | null;
  submitted_by?: number | null;
};

export class PowerDataModel {
  static findByPowerDataId(id: number) {
    return prisma.powerData.findUnique({
      where: { id },
    });
  }

  static async create(data: CreatePowerDataInput): Promise<PowerData> {
    console.log('Creating power data with data:', data);
    return prisma.powerData.create({
      data: {
        manufacturer_id: data.manufacturer_id,
        period: data.period ?? 'H1-2026',
        startTime: data.startTime,
        endTime: data.endTime,
        capacity_utilization: data.capacity_utilization ?? null,
        production_value: data.production_value ?? null,
        raw_material_cost: data.raw_material_cost ?? null,
        transport_cost: data.transport_cost ?? null,
        local_sourcing_percent: data.local_sourcing_percent ?? null,
        unsold_goods_value: data.unsold_goods_value ?? null,
        new_workers_employed: data.new_workers_employed ?? null,
        total_workers: data.total_workers ?? null,
        workers_left: data.workers_left ?? null,
        avg_interest_rate: data.avg_interest_rate ?? null,
        avg_exchange_rate: data.avg_exchange_rate ?? null,
        investment_land_buildings: data.investment_land_buildings ?? null,
        investment_plant_machinery: data.investment_plant_machinery ?? null,
        investment_furniture: data.investment_furniture ?? null,
        investment_motor_vehicles: data.investment_motor_vehicles ?? null,
        investment_assets_in_progress: data.investment_assets_in_progress ?? null,
        avg_grid_hours: data.avg_grid_hours ?? null,
        avg_power_outages: data.avg_power_outages ?? null,
        energy_diesel_cost: data.energy_diesel_cost ?? null,
        energy_gas_cost: data.energy_gas_cost ?? null,
        energy_gen_maintenance_cost: data.energy_gen_maintenance_cost ?? null,
        energy_other_cost: data.energy_other_cost ?? null,
        energy_other_source: data.energy_other_source ?? null,
        nigeria_first_policy_comment: data.nigeria_first_policy_comment ?? null,
        additional_comments: data.additional_comments ?? null,
        status: data.status ?? 'draft',
        submitted_at: data.submitted_at ?? null,
        submitted_by: data.submitted_by ?? null,
      },
    });
  }

  static async findById(id: number): Promise<PowerData | null> {
    return prisma.powerData.findUnique({
      where: { id },
    });
  }

  static async findByManufacturerId(manufacturer_id: number): Promise<PowerData[]> {
    return prisma.powerData.findMany({
      where: { manufacturer_id },
    });
  }

  static async findAll(): Promise<PowerData[]> {
    return prisma.powerData.findMany();
  }

  static async update(
    id: number,
    data: Partial<CreatePowerDataInput>
  ): Promise<PowerData> {
    const updateData = { ...data };
    delete updateData.manufacturer_id;
    return prisma.powerData.update({
      where: { id },
      data: updateData as any,
    });
  }

  static async delete(id: number): Promise<PowerData> {
    return prisma.powerData.delete({
      where: { id },
    });
  }
}
