import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, User } from '../generated/prisma/client.js';
import  prisma from '../services/prisma.service.js';


export type CreateUserInput = {
  name: string;
  email: string;
  password_hash: string;
  role?: Role;
  manufacturer_id?: number | null;
  is_active?: boolean;
};

export class UserModel {
  static findByUserId(userId: any) {
    return prisma.user.findUnique({
      where: { userId },
    });
  }
 
  static async create(data: CreateUserInput): Promise<User> {
    console.log('Creating user with data:', data);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: data.password_hash,
        role: data.role ?? Role.manufacturer,
        userId: this.generateUserId(),
        is_active: data.is_active ?? true,
      },
    });
  }
  static generateUserId(): string {
     return `USR_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }


  static async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  static async update(id: number, data: Partial<Omit<CreateUserInput, 'email'>>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }
}
