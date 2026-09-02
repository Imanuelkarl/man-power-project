import api from "../utils/api";
import { type PowerData as PowerDataPayload } from "../types/powerData.types";

export interface PowerDataRecord extends PowerDataPayload {
  id: number;
  createdAt: string;
  updatedAt: string;
}

const toApiPayload = (
  payload: Partial<PowerDataPayload> & { manufacturerId?: string },
) => ({
  manufacturer_id: payload.manufacturerId,
  period: payload.period,
  startTime: payload.startTime,
  endTime: payload.endTime,
  capacity_utilization: payload.capacityUtilization,
  production_value: payload.productionValue,
  raw_material_cost: payload.rawMaterialsCost,
  transport_cost: payload.rawMaterialsTransport,
  local_sourcing_percent: payload.localSourcing,
  unsold_goods_value: payload.unsoldGoods,
  new_workers_employed: payload.newHires,
  total_workers: payload.totalWorkers,
  workers_left: payload.workersLeft,
  avg_interest_rate: payload.interestRate,
  avg_exchange_rate: payload.exchangeRate,
  investment_land_buildings: payload.investLandBuildings,
  investment_plant_machinery: payload.investPlant,
  investment_furniture: payload.investFurniture,
  investment_motor_vehicles: payload.investVehicles,
  investment_assets_in_progress: payload.investInProgress,
  avg_grid_hours: payload.electricityHours,
  avg_power_outages: payload.powerOutages,
  energy_diesel_cost: payload.energyDiesel,
  energy_gas_cost: payload.energyGas,
  energy_gen_maintenance_cost: payload.energyGenerator,
  energy_other_cost: payload.energyOther,
  nigeria_first_policy_comment: payload.nigeriaFirstComment,
  status: payload.status,
  submitted_at: payload.status === "draft" ? null : payload.submittedAt,
  submitted_by: payload.submittedBy || undefined,
});

const fromApiRecord = (record: Record<string, any>): PowerDataRecord => ({
  id: Number(record.id),
  manufacturerId: String(record.manufacturer_id),
  period: record.period,
  startTime: new Date(record.startTime ?? "2026-01-01"),
  endTime: new Date(record.endTime ?? "2026-07-01"),
  capacityUtilization: record.capacity_utilization ?? 0,
  productionValue: record.production_value ?? 0,
  totalEnergyGenerated: record.total_energy_generated ?? 0,
  totalEnergyConsumed: record.total_energy_consumed ?? 0,
  rawMaterialsCost: record.raw_material_cost ?? 0,
  rawMaterialsTransport: record.transport_cost ?? 0,
  localSourcing: record.local_sourcing_percent ?? 0,
  unsoldGoods: record.unsold_goods_value ?? 0,
  newHires: record.new_workers_employed ?? 0,
  totalWorkers: record.total_workers ?? 0,
  workersLeft: record.workers_left ?? 0,
  interestRate: record.avg_interest_rate ?? 0,
  exchangeRate: record.avg_exchange_rate ?? 0,
  investLandBuildings: record.investment_land_buildings ?? 0,
  investPlant: record.investment_plant_machinery ?? 0,
  investFurniture: record.investment_furniture ?? 0,
  investVehicles: record.investment_motor_vehicles ?? 0,
  investInProgress: record.investment_assets_in_progress ?? 0,
  electricityHours: record.avg_grid_hours ?? 0,
  powerOutages: record.avg_power_outages ?? 0,
  energyDiesel: record.energy_diesel_cost ?? 0,
  energyGas: record.energy_gas_cost ?? 0,
  energyGenerator: record.energy_gen_maintenance_cost ?? 0,
  energyOther: record.energy_other_cost ?? 0,
  nigeriaFirstComment: record.nigeria_first_policy_comment ?? "",
  status: record.status,
  submittedAt: record.submitted_at ?? "",
  submittedBy: record.submitted_by ? String(record.submitted_by) : "",
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

const basePath = "/power-data";

const powerDataService = {
  createPowerData: async (payload: Omit<PowerDataPayload, "id">) => {
    const response = await api.post<Record<string, any>>(
      basePath,
      toApiPayload(payload),
    );
    return fromApiRecord(response.data);
  },

  getPowerData: async () => {
    const response = await api.get<PowerDataRecord[]>(basePath);
    return (response.data as unknown as Record<string, any>[]).map(
      fromApiRecord,
    );
  },

  getPowerDataById: async (id: number) => {
    const response = await api.get<PowerDataRecord>(`${basePath}/${id}`);
    return fromApiRecord(response.data as unknown as Record<string, any>);
  },

  getPowerDataByManufacturer: async (manufacturerId: number | string) => {
    const response = await api.get<PowerDataRecord[]>(
      `${basePath}/manufacturer/${manufacturerId}`,
    );
    return (response.data as unknown as Record<string, any>[]).map(
      fromApiRecord,
    );
  },

  updatePowerData: async (id: number, payload: Partial<PowerDataPayload>) => {
    const response = await api.put<Record<string, any>>(
      `${basePath}/${id}`,
      toApiPayload(payload),
    );
    return fromApiRecord(response.data);
  },

  deletePowerData: async (id: string) => {
    const response = await api.delete<{ message: string }>(`${basePath}/${id}`);
    return response.data;
  },
};

export default powerDataService;

export const createPowerData = powerDataService.createPowerData;
export const getPowerData = powerDataService.getPowerData;
export const getPowerDataByManufacturer =
  powerDataService.getPowerDataByManufacturer;
