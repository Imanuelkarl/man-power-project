import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { Role, User } from "../generated/prisma/client.js";
import { UserResponse } from "../types/user.types.js";
import EmailSender from "../utils/emailSender.js";
import { ManufacturerModel } from "../models/manufacturer.model.js";
import { Manufacturer } from "@prisma/browser.js";

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? "default_jwt_secret";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "1h") as NonNullable<
  SignOptions["expiresIn"]
>;
const emailSender = new EmailSender();

const RESET_TOKEN_EXPIRES_IN = (process.env.RESET_TOKEN_EXPIRES_IN ??
  "15m") as NonNullable<SignOptions["expiresIn"]>;

export type AuthPayload = {
  user: UserResponse;
  manufacturer?: Manufacturer;
  token: string;
};

export type SignupInput = {
  email: string;
  name: string;
  password: string;
  role?: Role;
  companyName?: string;
  manufacturer_id?: number | null;
};

export class AuthService {
  static async verifyUser(token: string) {
    const payload = this.verifyResetToken(token);
    console.log(payload);
    const user = await UserModel.findByUserId(payload.userId);
    if (!user) {
      throw new Error("User does not exist");
    }
    return this.sanitizeUser(user);
  }
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
        userId: user.userId,
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

  private static invalidatedTokens = new Set<string>();

  static logout(token: string) {
    this.invalidatedTokens.add(token);
  }

  static isTokenValid(token: string): boolean {
    return !this.invalidatedTokens.has(token);
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
    //  const user = {
    //   id:1,
    //   name: "Tester",
    //   email: "user@test-email.com",
    //   password_hash,
    //   role: "manufacturer",
    //   is_active: true,
    //   created_at: new Date(),
    //   updated_at: new Date()
    // } as User
    emailSender.sendInvite(
      this.generateToken(user),
      user.email,
      user.name,
      user.role,
    );
    if (input.role === "manufacturer") {
      if (!input.companyName) {
        UserModel.delete(user.id);
        throw new Error("Company Name is required to create manufacturer");
      }
      const company = await ManufacturerModel.create({
        name: input.companyName,
        email: input.email,
      });
      return {
        user: this.sanitizeUser(user),
        manufacturer: company,
        token: this.generateToken(user),
      };
    }

   
    

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
    // emailSender.sendMail({
    //   to: user.email,
    //   subject: "NEW SIGN IN",
    //   text:`Hi ${user.name.split(" ")[0]}There was a new sign in into your account if this was not you please login and change your password`
    // })
    console.log("User logged in:", user);
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

  static async ensureAdminUser(): Promise<void> {
    const email = "admin@man.org.ng";
    const password = "admin123";
    const existingAdmin = await UserModel.findByEmail(email);
    if (existingAdmin) {
      return;
    }

    const password_hash = await this.hashPassword(password);
    await UserModel.create({
      name: "Administrator",
      email,
      password_hash,
      role: Role.admin,
    });
  }

  static async createPasswordResetRequest(email: string): Promise<string> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    const generateToken = this.generateResetToken(user.id);
    emailSender.sendPasswordReset(generateToken, email);
    return "Token has been sent to your email";
  }
}

AuthService.ensureAdminUser().catch((error) => {
  console.error("Failed to ensure admin user:", error);
});
