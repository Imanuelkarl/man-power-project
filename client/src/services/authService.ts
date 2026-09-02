import type { SignupPayload, User } from "../types/user.types";
import api from "../utils/api";

type AuthResponse = {
  token: string;
  user: User;
  manufacturer?: import("../types/manufacturer.types").Manufacturer;
};

type LoginPayload = {
  email: string;
  password: string;
};

export type ResetPasswordPayload = {
  password: string;
};

export const login = async ({ email, password }: LoginPayload) => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    const data = response.data;
    localStorage.setItem("token", data.token);
    console.log("Login response data:", data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signup = async ({
  name,
  email,
  password,
  role = "manufacturer",
  companyName,
  manufacturerId,
}: SignupPayload) => {
  console.log("Signup payload:", {
    name,
    email,
    password,
    role,
    companyName,
    manufacturerId,
  });
  try {
    const response = await api.post<AuthResponse>("/auth/signup", {
      name,
      email,
      password,
      role, // Default role for signup
      companyName,
      manufacturerId,
    });
    const data = response.data;

    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};
export const logout = async () => {
  try {
    //await api.post("/auth/logout");
  } catch (e) {
    console.error(e);
  }
  return;
};
export const requestPasswordReset = async (email: string) => {
  console.log("Sending reset link");
  return api.post("/auth/reset-password", { email });
};

export const resetPassword = async (token: string, password: string) => {
  return api.post(`/auth/update-password`, { token, password });
};

export default {
  login,
  logout,
  signup,
  requestPasswordReset,
  resetPassword,
};
