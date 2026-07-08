import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { Role, User } from "@prisma/client.js";
import { UserResponse } from "../types/user.types.js";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "default_jwt_secret";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "1h") as NonNullable<
  SignOptions["expiresIn"]
>;
const RESET_TOKEN_EXPIRES_IN = (process.env.RESET_TOKEN_EXPIRES_IN ??
  "15m") as NonNullable<SignOptions["expiresIn"]>;

export type AuthPayload = {
  user: UserResponse;
  token: string;
};

export type SignupInput = {
  email: string;
  name: string;
  password: string;
  role?: Role;
  manufacturer_id?: number | null;
};

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
  }

  static generateResetToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: RESET_TOKEN_EXPIRES_IN,
    });
  }

  private static sanitizeUser(user: User): UserResponse {
    const { password_hash, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      id: String(user.id),
    } as UserResponse;
  }

  static verifyResetToken(token: string): { userId: number } {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  }

  static async signup(input: SignupInput): Promise<AuthPayload> {
    console.log("Signup input:", input);
    const existingUser = await UserModel.findByEmail(input.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const password_hash = await this.hashPassword(input.password);
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      password_hash,
      role: input.role ?? Role.manufacturer,
    });

    return {
      user: this.sanitizeUser(user),
      token: this.generateToken(user),
    };
  }

  static async login(email: string, password: string): Promise<AuthPayload> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const validPassword = await this.verifyPassword(
      password,
      user.password_hash,
    );
    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    return {
      user: this.sanitizeUser(user),
      token: this.generateToken(user),
    };
  }

  static async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<User> {
    const payload = this.verifyResetToken(token);
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new Error("Invalid reset token");
    }

    const password_hash = await this.hashPassword(newPassword);
    return UserModel.update(user.id, { password_hash });
  }

  static async createPasswordResetRequest(email: string): Promise<string> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return this.generateResetToken(user.id);
  }
}
