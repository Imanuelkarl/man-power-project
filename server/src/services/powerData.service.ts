import { PowerData } from "../generated/prisma/client.js";
import {
  PowerDataModel,
  CreatePowerDataInput,
} from "../models/powerData.model.js";

export type PowerDataResponse = Omit<PowerData, "created_at" | "updated_at"> & {
  created_at: string;
  updated_at: string;
};

export class PowerDataService {
  static sanitizePowerData(powerData: PowerData): PowerDataResponse {
    return {
      ...powerData,
      created_at: powerData.created_at.toISOString(),
      updated_at: powerData.updated_at.toISOString(),
    };
  }

  static async create(data: CreatePowerDataInput): Promise<PowerDataResponse> {
    console.log("Creating power data with data:", data);
    const powerData = await PowerDataModel.create(data);
    return this.sanitizePowerData(powerData);
  }

  static async findById(id: number): Promise<PowerDataResponse | null> {
    const powerData = await PowerDataModel.findById(id);
    if (!powerData) {
      return null;
    }
    return this.sanitizePowerData(powerData);
  }

  static async findByManufacturerId(
    manufacturer_id: number,
  ): Promise<PowerDataResponse[]> {
    const powerDataList =
      await PowerDataModel.findByManufacturerId(manufacturer_id);
    return powerDataList.map((pd) => this.sanitizePowerData(pd));
  }

  static async findAll(): Promise<PowerDataResponse[]> {
    const powerDataList = await PowerDataModel.findAll();
    return powerDataList.map((pd) => this.sanitizePowerData(pd));
  }

  static async update(
    id: number,
    data: Partial<CreatePowerDataInput>,
  ): Promise<PowerDataResponse> {
    const powerData = await PowerDataModel.update(id, data);
    return this.sanitizePowerData(powerData);
  }

  static async delete(id: number): Promise<PowerDataResponse> {
    const powerData = await PowerDataModel.delete(id);
    return this.sanitizePowerData(powerData);
  }
}
