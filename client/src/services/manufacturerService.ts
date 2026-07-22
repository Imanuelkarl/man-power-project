import type { Manufacturer } from "../types/manufacturer.types";
import api from "../utils/api";

export interface ManufacturerCreateData {
    name: string;
    email: string;
    password?: string;
    [key: string]: any;
}

export interface ManufacturerUpdateData {
    name?: string;
    email?: string;
    password?: string;
    [key: string]: any;
}



const manufacturerService = {
    create: async (data: ManufacturerCreateData) => {
        const response = await api.post<Manufacturer>("/manufacturers", data);
        return response.data;
    },

    findAll: async () => {
        const response = await api.get<Manufacturer[]>("/manufacturers");
        return response.data;
    },

    findById: async (id: number) => {
        const response = await api.get<Manufacturer>(`/manufacturers/${id}`);
        return response.data;
    },

    findByEmail: async (email: string) => {
        const response = await api.get<Manufacturer>(`/manufacturers/email/${email}`);
        return response.data;
    },

    update: async (id: number, data: ManufacturerUpdateData) => {
        const response = await api.put<Manufacturer>(`/manufacturers/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/manufacturers/${id}`);
        return response.data;
    },
};

export default manufacturerService;
