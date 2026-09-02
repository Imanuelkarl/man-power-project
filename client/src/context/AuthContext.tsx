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
import { clearClientStores } from "../lib/store";
import { useData } from "../lib/store";
import manufacturerService from "../services/manufacturerService";

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

  const loadManufacturerForUser = async (authenticatedUser: User) => {
    if (authenticatedUser.role !== "manufacturer") return authenticatedUser;

    try {
      const manufacturer = await manufacturerService.findByManId(
        authenticatedUser.manufacturerId
          ? authenticatedUser.manufacturerId
          : "",
      );
      useData.setState((state) => ({
        manufacturers: [
          ...state.manufacturers.filter(
            (item) => item.manId !== manufacturer.manId,
          ),
          manufacturer,
        ],
        manufacturersHydrated: true,
      }));
      return {
        ...authenticatedUser,
        manufacturerId: manufacturer.manId,
        companyId: manufacturer.manId,
        companyName: manufacturer.name,
      };
    } catch (error) {
      console.error("Unable to load manufacturer profile", error);
      return authenticatedUser;
    }
  };

  const loadDashboardDataForUser = async (authenticatedUser: User) => {
    if (authenticatedUser.role === "manufacturer") {
      return loadManufacturerForUser(authenticatedUser);
    }

    await Promise.all([
      useData.getState().fetchManufacturers(),
      useData.getState().fetchQuestionnaires(),
    ]);
    return authenticatedUser;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await loginService({ email, password });
      setUser(await loadDashboardDataForUser(data.user));
    } catch (error) {
      console.error("Error logging in user", error);
    } finally {
      setLoading(false);
    }

    navigate("/");
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/auth/verify-token");
        setUser(await loadDashboardDataForUser(response.data.user));
      } catch (e) {
      } finally {
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
    try {
      await logoutService();
    } finally {
      clearClientStores();
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    await resetPasswordService(email);
    console.log("Password reset request sent");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, signup, resetPassword, loading }}
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
