import { User } from "../generated/prisma/client.js";
import { CreateUserInput, UserModel } from "../models/user.model.js";
import { UserResponse } from "../types/user.types.js";
import bcrypt from "bcrypt";

export type UpdateUserInput = Partial<Omit<CreateUserInput, "password_hash">>;

export class UserService {
  static sanitizeUser(user: User): UserResponse {
    const { password_hash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      id: String(user.id),
    } as UserResponse;
  }

  static async findById(id: number): Promise<UserResponse | null> {
    const user = await UserModel.findById(id);
    return user ? this.sanitizeUser(user) : null;
  }

  static async findByUserId(userId: string): Promise<UserResponse | null> {
    const user = await UserModel.findByUserId(userId);
    return user ? this.sanitizeUser(user) : null;
  }

  static async findByEmail(email: string): Promise<UserResponse | null> {
    const user = await UserModel.findByEmail(email);
    return user ? this.sanitizeUser(user) : null;
  }

  static async findAll(): Promise<UserResponse[]> {
    const users = await UserModel.findAll();
    return users.map((user) => this.sanitizeUser(user));
  }

  static async update(
    id: number,
    data: UpdateUserInput & { temporaryPassword?: string },
  ): Promise<UserResponse> {
    const { temporaryPassword, ...updates } = data;
    const user = await UserModel.update(id, {
      ...updates,
      ...(temporaryPassword
        ? { password_hash: await bcrypt.hash(temporaryPassword, 10) }
        : {}),
    });
    return this.sanitizeUser(user);
  }

  static async delete(id: number): Promise<UserResponse> {
    const user = await UserModel.delete(id);
    return this.sanitizeUser(user);
  }
}
