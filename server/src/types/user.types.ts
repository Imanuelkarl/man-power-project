import { Role } from "@prisma/enums.js";

export interface UserResponse {
  id: string;
  userId: string;
  email: string;
  name?: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}