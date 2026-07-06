import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "admin" | "manufacturer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId?: string;
}

export interface Manufacturer {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  branch: string;
  sectoralGroup: string;
  subSector: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface Questionnaire {
  id: string;
  manufacturerId: string;
  period: string; // e.g. "H1 2026"
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
}

// -------------------- Auth --------------------
interface AuthState {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  register: (name: string, email: string, password: string, companyId?: string) => { ok: boolean; error?: string };
}

// Seeded credentials so the demo is usable immediately.
const DEFAULT_USERS: Array<User & { password: string }> = [
  { id: "u-admin", email: "admin@man.org.ng", password: "admin123", name: "MAN Administrator", role: "admin" },
];

export const useAuth = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      login: (email, password) => {
        const store = useUsers.getState();
        const found = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!found) return { ok: false, error: "Invalid email or password" };
        const { password: _pw, ...safe } = found;
        set({ user: safe });
        return { ok: true };
      },
      logout: () => set({ user: null }),
      register: (name, email, password, companyId) => {
        const store = useUsers.getState();
        if (store.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: "Email already registered" };
        }
        const newUser: User & { password: string } = {
          id: `u-${Date.now()}`,
          email,
          password,
          name,
          role: "manufacturer",
          companyId,
        };
        store.addUser(newUser);
        const { password: _pw, ...safe } = newUser;
        set({ user: safe });
        return { ok: true };
      },
    }),
    { name: "man.auth" }
  )
);

// -------------------- Users (mock DB) --------------------
interface UsersState {
  users: Array<User & { password: string }>;
  addUser: (u: User & { password: string }) => void;
  removeUser: (id: string) => void;
}

export const useUsers = create<UsersState>()(
  persist(
    (set) => ({
      users: DEFAULT_USERS,
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      removeUser: (id) => set((s) => ({ users: s.users.filter((x) => x.id !== id) })),
    }),
    { name: "man.users" }
  )
);

// -------------------- Data --------------------
interface DataState {
  manufacturers: Manufacturer[];
  questionnaires: Questionnaire[];
  addManufacturer: (m: Manufacturer) => void;
  updateManufacturer: (id: string, patch: Partial<Manufacturer>) => void;
  removeManufacturer: (id: string) => void;
  addQuestionnaire: (q: Questionnaire) => void;
  upsertQuestionnaire: (q: Questionnaire) => void;
  clearAll: () => void;
  bulkSet: (m: Manufacturer[], q: Questionnaire[]) => void;
}

export const useData = create<DataState>()(
  persist(
    (set) => ({
      manufacturers: [],
      questionnaires: [],
      addManufacturer: (m) => set((s) => ({ manufacturers: [...s.manufacturers, m] })),
      updateManufacturer: (id, patch) =>
        set((s) => ({
          manufacturers: s.manufacturers.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeManufacturer: (id) =>
        set((s) => ({
          manufacturers: s.manufacturers.filter((m) => m.id !== id),
          questionnaires: s.questionnaires.filter((q) => q.manufacturerId !== id),
        })),
      addQuestionnaire: (q) => set((s) => ({ questionnaires: [...s.questionnaires, q] })),
      upsertQuestionnaire: (q) =>
        set((s) => {
          const idx = s.questionnaires.findIndex(
            (x) => x.manufacturerId === q.manufacturerId && x.period === q.period
          );
          if (idx === -1) return { questionnaires: [...s.questionnaires, q] };
          const copy = s.questionnaires.slice();
          copy[idx] = q;
          return { questionnaires: copy };
        }),
      clearAll: () => set({ manufacturers: [], questionnaires: [] }),
      bulkSet: (m, q) => set({ manufacturers: m, questionnaires: q }),
    }),
    { name: "man.data" }
  )
);

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

export const NIGERIAN_STATES: Array<{ state: string; city: string; lat: number; lng: number }> = [
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