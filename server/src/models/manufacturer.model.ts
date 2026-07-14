import { Manufacturer } from '../generated/prisma/client.js';
import prisma from '../services/prisma.service.js';

export type CreateManufacturerInput = {
  name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  sectoral_group?: string | null;
  sub_sector?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  registration_number?: string | null;
  year_established?: number | null;
  employee_count?: number | null;
  is_active?: boolean;
};

export class ManufacturerModel {
  static findByManufacturerId(id: number) {
    return prisma.manufacturer.findUnique({
      where: { id },
    });
  }

  static async create(data: CreateManufacturerInput): Promise<Manufacturer> {
    console.log('Creating manufacturer with data:', data);
    return prisma.manufacturer.create({
      data: {
        name: data.name,
        contact_person: data.contact_person ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        sectoral_group: data.sectoral_group ?? null,
        sub_sector: data.sub_sector ?? null,
        address: data.address ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        registration_number: data.registration_number ?? null,
        year_established: data.year_established ?? null,
        employee_count: data.employee_count ?? null,
        is_active: data.is_active ?? true,
      },
    });
  }

  static async findById(id: number): Promise<Manufacturer | null> {
    return prisma.manufacturer.findUnique({
      where: { id },
    });
  }

  static async findByEmail(email: string): Promise<Manufacturer | null> {
    return prisma.manufacturer.findFirst({
      where: { email },
    });
  }

  static async findAll(): Promise<Manufacturer[]> {
    return prisma.manufacturer.findMany();
  }

  static async update(
    id: number,
    data: Partial<CreateManufacturerInput>
  ): Promise<Manufacturer> {
    return prisma.manufacturer.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number): Promise<Manufacturer> {
    return prisma.manufacturer.delete({
      where: { id },
    });
  }
}
