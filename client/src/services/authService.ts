import api from "../utils/api";

type AuthResponse = {
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name?: string;
    };
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
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    const data = response.data.data;
    localStorage.setItem("token", data.token);
    console.log("Login response data:", data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signup = async ({ email, password, name }: SignupPayload) => {
  console.log("Signup payload:", { email, password, name });
  try {
    const response = await api.post<AuthResponse>("/auth/signup", {
      email,
      password,
      name,
    });
    const data = response.data.data;
    console.log("Signup response data:", data);
    localStorage.setItem("token", data.token);
    
    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
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
