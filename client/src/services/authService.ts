import api from "../utils/api";

type AuthResponse = {
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name?: string;
      role: 'manufacturer'| 'admin'
    };
  };
};

type SignupPayload = {
  name?: string;
  email: string;
  password: string;
  role?: "manufacturer" | "investor"; // Optional role for signup
  
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
    const data = response.data.data;
    localStorage.setItem("token", data.token);
    console.log("Login response data:", data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signup = async ({ name, email, password, role = "manufacturer" }: SignupPayload) => {
  console.log("Signup payload:", {name, email, password, role });
  try {
    const response = await api.post<AuthResponse>("/auth/signup", {
      name,
      email,
      password,
      role, // Default role for signup
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
export const logout = async ()=>{
  try{
    //await api.post("/auth/logout");
  }catch (e){
    console.error(e);
  }
  return;
  
}
export const requestPasswordReset = async (email: string) => {
  return api.post("/auth/password-reset", { email });
};

export const resetPassword = async (token: string, password: string) => {
  return api.post(`/auth/reset-password/${token}`, { password });
};

export default {
  login,
  logout,
  signup,
  requestPasswordReset,
  resetPassword,
};
