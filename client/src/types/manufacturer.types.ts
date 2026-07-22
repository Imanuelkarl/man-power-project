export interface Manufacturer {
  id: number;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  branch: string;
  sectoralGroup: string;
  subSector: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  createdAt: string;
}

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
