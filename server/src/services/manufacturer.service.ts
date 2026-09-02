import { Manufacturer } from "../generated/prisma/client.js";
import {
  ManufacturerModel,
  CreateManufacturerInput,
} from "../models/manufacturer.model.js";

export type ManufacturerResponse = Omit<
  Manufacturer,
  "created_at" | "updated_at"
> & {
  created_at: string;
  updated_at: string;
};

export class ManufacturerService {
  static sanitizeManufacturer(
    manufacturer: Manufacturer,
  ): ManufacturerResponse {
    return {
      ...manufacturer,
      created_at: manufacturer.created_at.toISOString(),
      updated_at: manufacturer.updated_at.toISOString(),
    };
  }

  static async create(
    data: CreateManufacturerInput,
  ): Promise<ManufacturerResponse> {
    console.log("Creating manufacturer with data:", data);
    const payload = {
      ...data,
      is_active: data.is_active ?? true, // Default to true if not provided
    };
    const manufacturer = await ManufacturerModel.create(payload);
    return this.sanitizeManufacturer(manufacturer);
  }

  static async findById(id: number): Promise<ManufacturerResponse | null> {
    const manufacturer = await ManufacturerModel.findById(id);
    if (!manufacturer) {
      return null;
    }
    return this.sanitizeManufacturer(manufacturer);
  }
  static async findByManId(manId: string): Promise<ManufacturerResponse | null> {
    const manufacturer = await ManufacturerModel.findByManId(manId);
    if (!manufacturer) {
      return null;
    }
    return this.sanitizeManufacturer(manufacturer);
  }

  static async findByEmail(
    email: string,
  ): Promise<ManufacturerResponse | null> {
    const manufacturer = await ManufacturerModel.findByEmail(email);
    if (!manufacturer) {
      return null;
    }
    return this.sanitizeManufacturer(manufacturer);
  }

  static async findAll(): Promise<ManufacturerResponse[]> {
    const manufacturers = await ManufacturerModel.findAll();
    console.log("Found manufacturers:", manufacturers);
    return manufacturers.map((m) => this.sanitizeManufacturer(m));
  }

  static async update(
    id: number,
    data: Partial<CreateManufacturerInput>,
  ): Promise<ManufacturerResponse> {
    const manufacturer = await ManufacturerModel.update(id, data);
    return this.sanitizeManufacturer(manufacturer);
  }

  static async delete(id: number): Promise<ManufacturerResponse> {
    const manufacturer = await ManufacturerModel.delete(id);
    return this.sanitizeManufacturer(manufacturer);
  }
}
