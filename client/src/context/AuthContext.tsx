import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  login as loginService,
  signup as signupService,
  requestPasswordReset as resetPasswordService,
  logout as logoutService,
} from "../services/authService";
import { navigate } from "../components/navigate";
import api from "../utils/api";
import type { User } from "../types/user.types";


type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  signup: (
    name: string,
    email: string,
    password: string,
    role?: "manufacturer" | "investor",
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const data = await loginService({ email, password });
    setUser(data.user);
    console.log("user set successfully", data.user);
    navigate("/");
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/verify-token");
        console.log(response);
        setUser(response.data.data.user);
        
      } catch(e) {

      }finally{
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const signup = async (
    name: string,
    email: string,
    password: string,
    role?: "manufacturer" | "investor",
  ) => {
    const data = await signupService({ name, email, password, role });
    setUser(data.user);
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
    await logoutService();
  };

  const resetPassword = async (email: string) => {
    await resetPasswordService(email);
    console.log("Password reset request sent");
  };
  

  return (
    <AuthContext.Provider
      value={{ user, login, logout, signup, resetPassword,loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
