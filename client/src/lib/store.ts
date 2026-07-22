import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user.types";
import manufacturerService from "../services/manufacturerService";
import userService from "../services/userService";
import { login as loginUser, signup as signupUser } from "../services/authService";
import type { Manufacturer } from "../types/manufacturer.types";

export type { Manufacturer };

export type Role = "admin" | "manufacturer" | "investor";

export interface PowerData {
  id: string;
  manufacturerId: number;
  period: string; // e.g. "H1 2026"
  startTime: Date;
  endTime: Date;
  capacityUtilization: number;
  productionValue: number;
  rawMaterialsCost: number;
  rawMaterialsTransport: number;
  localSourcing: number;
  unsoldGoods: number;
  newHires: number;
  totalWorkers: number;
  workersLeft: number;
  interestRate: number;
  exchangeRate: number;
  investLandBuildings: number;
  investPlant: number;
  investFurniture: number;
  investVehicles: number;
  investInProgress: number;
  electricityHours: number;
  powerOutages: number;
  energyDiesel: number;
  energyGas: number;
  energyGenerator: number;
  energyOther: number;
  nigeriaFirstComment: string;
  submittedAt: string;
  submittedBy: string;
}

// -------------------- Auth --------------------
interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    companyId?: string,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email, password) => {
        try {
          const { user } = await loginUser({email, password});
          set({ user });
          return { ok: true };
        } catch {
          return { ok: false, error: "Invalid email or password" };
        }
      },
      logout: () => set({ user: null }),
      register: async (name, email, password, companyId) => {
        try {
          const { user } = await signupUser({
            name,
            email,
            password,
            companyName: companyId,
          });
          set({ user });
          return { ok: true };
        } catch {
          return { ok: false, error: "Unable to register user" };
        }
      },
    }),
    { name: "man.auth" },
  ),
);

// -------------------- Users --------------------
interface UsersState {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (u: User) => void;
  removeUser: (id: number) => void;
  updatePassword: (id: number, password: string) => Promise<void>;
}

export const useUsers = create<UsersState>()(
  persist(
    (set) => ({
      users: [],
      loading: false,
      fetchUsers: async () => {
        set({ loading: true });
        try {
          const users = await userService.findAll();
          set({ users, loading: false });
        } catch {
          set({ loading: false });
        }
      },
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      removeUser: (id) =>
        set((s) => ({ users: s.users.filter((x) => x.id !== id) })),
      updatePassword: async (id, password) => {
        await userService.update(id, { password });
      },
    }),
    { name: "man.users", partialize: () => ({ users: [], loading: false }) },
  ),
);

// -------------------- Data --------------------
interface DataState {
  manufacturers: Manufacturer[];
  questionnaires: PowerData[];
  addManufacturer: (m: Manufacturer) => void;
  updateManufacturer: (
    id: number,
    patch: Partial<Manufacturer>,
  ) => Promise<void>;
  removeManufacturer: (id: number) => void;
  addQuestionnaire: (q: PowerData) => void;
  getQuestionnaireByEmail: (email: string) => PowerData[];
  upsertQuestionnaire: (q: PowerData) => void;
  removeQuestionnaire: (id: string) => void;
  clearAll: () => void;
  bulkSet: (m: Manufacturer[], q: PowerData[]) => void;
}

export const useData = create<DataState>()(
  persist(
    (set): DataState => ({
      manufacturers: [],
      questionnaires: [],
      addManufacturer: (m) => {
        set((s) => ({ manufacturers: [...s.manufacturers, m] }));
      },
      updateManufacturer: async (id, patch) => {
        const manufacturer = await manufacturerService.update(id, patch);
        set((s) => ({
          manufacturers: [...s.manufacturers, manufacturer],
        }));
      },
      removeManufacturer: (id) =>
        set((s) => ({
          manufacturers: s.manufacturers.filter((m) => m.id !== id),
          questionnaires: s.questionnaires.filter(
            (q) => q.manufacturerId !== id,
          ),
        })),
      addQuestionnaire: (q) =>
        set((s) => ({ questionnaires: [...s.questionnaires, q] })),
      getQuestionnaireByEmail: (email): PowerData[] => {
        const manufacturer = useData
          .getState()
          .manufacturers.find(
            (m) => m.email.toLowerCase() === email.toLowerCase(),
          );

        if (!manufacturer) return [];

        return useData
          .getState()
          .questionnaires.filter(
            (q) => q.manufacturerId === manufacturer.id,
          );
      },
      removeQuestionnaire: (id) =>
        set((s) => ({
          questionnaires: s.questionnaires.filter((q) => q.id !== id),
        })),
      upsertQuestionnaire: (q) =>
        set((s) => {
          const idx = s.questionnaires.findIndex(
            (x) =>
              x.manufacturerId === q.manufacturerId && x.period === q.period,
          );
          if (idx === -1) return { questionnaires: [...s.questionnaires, q] };
          const copy = s.questionnaires.slice();
          copy[idx] = q;
          return { questionnaires: copy };
        }),
      clearAll: () => set({ manufacturers: [], questionnaires: [] }),
      bulkSet: (m, q) => set({ manufacturers: m, questionnaires: q }),
    }),
    { name: "man.data" },
  ),
);

// -------------------- Invites & Password Resets --------------------

export const SECTORAL_GROUPS = [
  "Food, Beverage & Tobacco",
  "Chemical & Pharmaceuticals",
  "Textile, Apparel & Footwear",
  "Wood & Wood Products",
  "Pulp, Paper & Publishing",
  "Non-Metallic Mineral Products",
  "Basic Metal, Iron & Steel",
  "Motor Vehicle & Miscellaneous Assembly",
  "Electrical & Electronics",
  "Domestic & Industrial Plastic, Rubber",
];

export const NIGERIAN_STATES: Array<{
  state: string;
  city: string;
  lat: number;
  lng: number;
}> = [
  { state: "Lagos", city: "Ikeja", lat: 6.6018, lng: 3.3515 },
  { state: "Lagos", city: "Apapa", lat: 6.4488, lng: 3.3595 },
  { state: "Lagos", city: "Agbara", lat: 6.5031, lng: 3.0908 },
  { state: "Ogun", city: "Sango-Ota", lat: 6.6912, lng: 3.2417 },
  { state: "Ogun", city: "Abeokuta", lat: 7.1475, lng: 3.3619 },
  { state: "Oyo", city: "Ibadan", lat: 7.3775, lng: 3.947 },
  { state: "Rivers", city: "Port Harcourt", lat: 4.8156, lng: 7.0498 },
  { state: "Kano", city: "Kano", lat: 12.0022, lng: 8.592 },
  { state: "Kaduna", city: "Kaduna", lat: 10.5222, lng: 7.4383 },
  { state: "Anambra", city: "Onitsha", lat: 6.1667, lng: 6.7833 },
  { state: "Anambra", city: "Nnewi", lat: 6.0175, lng: 6.9106 },
  { state: "Enugu", city: "Enugu", lat: 6.4402, lng: 7.4943 },
  { state: "Abia", city: "Aba", lat: 5.1066, lng: 7.3667 },
  { state: "Delta", city: "Warri", lat: 5.5167, lng: 5.75 },
  { state: "Edo", city: "Benin City", lat: 6.335, lng: 5.6037 },
  { state: "Cross River", city: "Calabar", lat: 4.9757, lng: 8.3417 },
  { state: "Plateau", city: "Jos", lat: 9.9285, lng: 8.8921 },
  { state: "FCT", city: "Abuja", lat: 9.0765, lng: 7.3986 },
];
