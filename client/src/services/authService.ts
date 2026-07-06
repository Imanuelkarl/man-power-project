import api from "../utils/api";

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
};

type SignupPayload = {
  email: string;
  password: string;
  name?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ResetPasswordPayload = {
  password: string;
};

export const login = async ({ email, password }: LoginPayload) => {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  const data = response.data;
  localStorage.setItem("token", data.token);
  return data;
};

export const signup = async ({ email, password, name }: SignupPayload) => {
  const response = await api.post<AuthResponse>("/auth/signup", {
    email,
    password,
    name,
  });
  const data = response.data;
  localStorage.setItem("token", data.token);
  return data;
};

export const requestPasswordReset = async (email: string) => {
  return api.post("/auth/password-reset", { email });
};

export const resetPassword = async (token: string, password: string) => {
  return api.post(`/auth/reset-password/${token}`, { password });
};

export default {
  login,
  signup,
  requestPasswordReset,
  resetPassword,
};
