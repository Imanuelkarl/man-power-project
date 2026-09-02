import type {
  Manufacturer,
  ManufacturerUpdateData,
} from "../types/manufacturer.types";
import type { Success } from "../types/response.types";
import api from "../utils/api";

export interface ManufacturerCreateData {
  name: string;
  email?: string;
  password?: string;
  [key: string]: any;
}

const manufacturerService = {
  create: async (data: ManufacturerCreateData) => {
    const response = await api.post<Manufacturer>("/manufacturers", data);
    const manufacturer = response.data as Manufacturer & {
      created_at?: string;
    };
    return {
      ...manufacturer,
      createdAt: manufacturer.createdAt ?? manufacturer.created_at,
    };
  },

  findAll: async () => {
    const response = await api.get<Manufacturer[]>("/manufacturers");
    return (
      response.data as unknown as (Manufacturer & { created_at?: string })[]
    ).map((manufacturer) => ({
      ...manufacturer,
      createdAt: manufacturer.createdAt ?? manufacturer.created_at,
    }));
  },

  findById: async (id: number) => {
    const response = await api.get<Manufacturer>(`/manufacturers/id/${id}`);
    return normalizeManufacturer(response.data);
  },

  findByEmail: async (email: string) => {
    const response = await api.get<Manufacturer>(
      `/manufacturers/email/${email}`,
    );
    return normalizeManufacturer(response.data);
  },
  findByManId: async (manId: string) => {
    const response = await api.get<Manufacturer>(
      `/manufacturers/${manId}`,
    );
    return normalizeManufacturer(response.data);
  },

  update: async (id: number, data: ManufacturerUpdateData) => {
    // map alternative fields to the API schema
    // const mapped = {
    //     ...(data as any),
    // };

    // // whitelist fields that belong to ManufacturerUpdateData to avoid sending unwanted props
    // const allowedFields: (keyof ManufacturerUpdateData)[] = [
    //     // common updateable manufacturer fields - adjust if your interface differs
    //     "name",
    //     "email",
    //     "lat",
    //     "lng",
    //     "sub_sector",
    //     "sectoral_group",
    //     "address",
    //     "employee_count",
    //     "city"
    // ];

    // const uploadData = Object.keys(mapped).reduce((acc, key) => {
    //     if ((allowedFields as string[]).includes(key)) {
    //         (acc as any)[key] = (mapped as any)[key];
    //     }
    //     return acc;
    // }, {} as ManufacturerUpdateData);
    const response = await api.put<Success>(`/manufacturers/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ message: string }>(
      `/manufacturers/${id}`,
    );
    return response.data;
  },
};

function normalizeManufacturer(
  manufacturer: Manufacturer & { created_at?: string },
): Manufacturer {
  return {
    ...manufacturer,
    createdAt: manufacturer.createdAt ?? manufacturer.created_at,
  };
}

export default manufacturerService;
