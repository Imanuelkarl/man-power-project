import api from "../utils/api";
import { type PowerData as PowerDataPayload} from "../types/powerData.types"



export interface PowerDataRecord extends PowerDataPayload {
  id: any;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

const basePath = "/power-data";

export const createPowerData = async (payload: PowerDataPayload) => {
  const response = await api.post<PowerDataRecord>(basePath, payload);
  return response.data;
};

export const getPowerData = async () => {
  const response = await api.get<PowerDataRecord[]>(basePath);
  return response.data;
};

export const getPowerDataById = async (id: string) => {
  const response = await api.get<PowerDataRecord>(`${basePath}/${id}`);
  return response.data;
};

export const getPowerDataByManufacturer = async (manufacturerId: string) => {
  const response = await api.get<PowerDataRecord[]>(`${basePath}/manufacturer/${manufacturerId}`);
  return response.data;
};

export const updatePowerData = async (id: string, payload: Partial<PowerDataPayload>) => {
  const response = await api.put<PowerDataRecord>(`${basePath}/${id}`, payload);
  return response.data;
};

export const deletePowerData = async (id: string) => {
  const response = await api.delete<{ message: string }>(`${basePath}/${id}`);
  return response.data;
};
