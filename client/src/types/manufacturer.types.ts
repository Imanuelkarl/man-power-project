export interface Manufacturer {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  branch: string;
  sectoral_group: string;
  sub_sector: string;
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
  name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  sectoral_group?: string | null;
  sub_sector?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  registration_number?: string | null;
  year_established?: number | null;
  employee_count?: number | null;
  is_active?: boolean;
}
