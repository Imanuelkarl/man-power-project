import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user.types";

export type Role = "admin" | "manufacturer"|"investor";

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

export interface PowerData {
  id: string;
  manufacturerId: string;
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
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  register: (name: string, email: string, password: string, companyId?: string) => { ok: boolean; error?: string };
}

// Seeded credentials so the demo is usable immediately.
const DEFAULT_USERS: Array<User & { password: string }> = [
  { id: 0, email: "admin@man.org.ng", password: "admin123", name: "MAN Administrator",is_active:true, role: "admin" },
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
          id: store.users.length,
          email,
          password,
          name,
          role: "manufacturer",
          is_active:true,
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
  removeUser: (id: number) => void;
  updatePassword: (id: number, password: string) => void;
}

export const useUsers = create<UsersState>()(
  persist(
    (set) => ({
      users: DEFAULT_USERS,
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      removeUser: (id) => set((s) => ({ users: s.users.filter((x) => x.id !== id) })),
      updatePassword: (id: number, password: string) =>
        set((s) => ({ users: s.users.map((x) => (x.id === id ? { ...x, password } : x)) })),
    }),
    { name: "man.users" }
  )
);

// -------------------- Data --------------------
interface DataState {
  manufacturers: Manufacturer[];
  questionnaires: PowerData[];
  users: User[];
  addUser: (u: User) => void;
  updateUser:(id: number, patch: Partial<User>)=> void;
  removeUser: (id: number)=> void;
  addManufacturer: (m: Manufacturer) => void; 
  updateManufacturer: (id: string, patch: Partial<Manufacturer>) => void;
  removeManufacturer: (id: string) => void;
  addQuestionnaire: (q: PowerData) => void;
  upsertQuestionnaire: (q: PowerData) => void;
  removeQuestionnaire: (id: string) => void;
  clearAll: () => void;
  bulkSet: (m: Manufacturer[], q: PowerData[]) => void;
}

export const useData = create<DataState>()(
  persist(
    (set) => ({
      manufacturers: [],
      questionnaires: [],
      users:[],
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeUser: (id) =>
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
        })),
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
      removeQuestionnaire: (id) =>
      set((s) => ({
         questionnaires: s.questionnaires.filter((q) => q.manufacturerId !== id),
      })),
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

// -------------------- Invites & Password Resets --------------------
export interface InviteToken {
  token: string;
  email: string;
  name: string;
  companyId?: string;
  createdAt: string;
  used: boolean;
}

export interface ResetToken {
  token: string;
  id: number;
  userId: string;
  email: string;
  createdAt: string;
  used: boolean;
}

interface TokensState {
  invites: InviteToken[];
  resets: ResetToken[];
  createInvite: (input: { email: string; name: string; companyId?: string }) => { ok: boolean; token?: string; error?: string };
  consumeInvite: (token: string, password: string) => { ok: boolean; error?: string };
  createResetForEmail: (email: string) => { ok: boolean; token?: string; error?: string };
  consumeReset: (token: string, password: string) => { ok: boolean; error?: string };
}

function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const useTokens = create<TokensState>()(
  persist(
    (set, get) => ({
      invites: [],
      resets: [],
      createInvite: ({ email, name, companyId }) => {
        const users = useUsers.getState();
        if (users.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: "A user with this email already exists" };
        }
        const existing = get().invites.find(
          (i) => !i.used && i.email.toLowerCase() === email.toLowerCase()
        );
        if (existing) return { ok: true, token: existing.token };
        const token = randomToken();
        set((s) => ({
          invites: [
            ...s.invites,
            { token, email, name, companyId, createdAt: new Date().toISOString(), used: false },
          ],
        }));
        return { ok: true, token };
      },
      consumeInvite: (token, password) => {
        const invite = get().invites.find((i) => i.token === token);
        if (!invite) return { ok: false, error: "Invite link is invalid" };
        if (invite.used) return { ok: false, error: "Invite link has already been used" };
        const users = useUsers.getState();
        if (users.users.some((u) => u.email.toLowerCase() === invite.email.toLowerCase())) {
          return { ok: false, error: "An account already exists for this email" };
        }
        users.addUser({
          id: users.users.length,
          email: invite.email,
          name: invite.name,
          password,
          role: "manufacturer",
          is_active:true,
          companyName: invite.companyId,
        });
        set((s) => ({
          invites: s.invites.map((i) => (i.token === token ? { ...i, used: true } : i)),
        }));
        return { ok: true };
      },
      createResetForEmail: (email) => {
        const users = useUsers.getState();
        const user = users.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        // Always return ok so we don't leak account existence, but only mint a token if found.
        if (!user) return { ok: true };
        const token = randomToken();
        set((s: { resets: any; }) => ({
          resets: [
            ...s.resets,
            { token, userId: user.id, email: user.email, createdAt: new Date().toISOString(), used: false },
          ],
        }));
        return { ok: true, token };
      },
      consumeReset: (token, password) => {
        const reset = get().resets.find((r) => r.token === token);
        if (!reset) return { ok: false, error: "Reset link is invalid" };
        if (reset.used) return { ok: false, error: "Reset link has already been used" };
        useUsers.getState().updatePassword(reset.id, password);
        set((s) => ({
          resets: s.resets.map((r) => (r.token === token ? { ...r, used: true } : r)),
        }));
        return { ok: true };
      },
    }),
    { name: "man.tokens" }
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