import type {
    ClusterDefinition,
} from "../types/cluster.types";
import api from "../lib/api";

export interface ManufacturerCreateData {
  name: string;
  email?: string;
  password?: string;
  [key: string]: any;
}

const clustersService = {
  async getClusters(): Promise<ClusterDefinition[]> {
    const response = await api.get<ClusterDefinition[]>("/clusters");
    return response.data;
  },

  async saveCluster(def: ClusterDefinition): Promise<ClusterDefinition> {
    const response = await api.post<ClusterDefinition>("/clusters", def);
    return response.data;
  },

  async deleteCluster(id: string): Promise<void> {
    await api.delete(`/clusters/${encodeURIComponent(id)}`);
  },
};



export default clustersService;
