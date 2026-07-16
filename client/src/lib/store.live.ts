import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as authService from "../services/authService";
import manufacturerService, { type Manufacturer } from "../services/manufacturerService";
import * as powerDataService from "../services/powerDataService";

type User = {
  id: number;
  email: string;
  name?: string;
  role?: string;
};

type State = {
  token: string | null;
  user: User | null;
  manufacturers: Manufacturer[];
  powerData: powerDataService.PowerDataRecord[];
  loading: boolean;
  error?: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { name?: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchManufacturers: () => Promise<void>;
  fetchPowerData: (manufacturerId?: string) => Promise<void>;
  createPowerData: (payload: powerDataService.PowerDataPayload) => Promise<void>;
  addManufacturer: (manufacturer: Manufacturer) => void;
  updateManufacturer: (manufacturer: Manufacturer) => void;
  removeManufacturer: (id: number) => void;
  addPowerData: (payload: powerDataService.PowerDataRecord) => void;
  updatePowerData: (payload: powerDataService.PowerDataRecord) => void;
  removePowerData: (id: string | number) => void;
};

const useLiveStore = create<State>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      manufacturers: [],
      powerData: [],

      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.login({ email, password });
          set({ token: data.token, user: data.user } as Partial<State> as State);
        } catch (e: any) {
          set({ error: e?.message || "Login failed" });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      signup: async (payload) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.signup(payload as any);
          set({ token: data.token, user: data.user } as Partial<State> as State);
        } catch (e: any) {
          set({ error: e?.message || "Signup failed" });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        set({ loading: true, error: null });
        try {
          await authService.logout();
        } finally {
          set({ token: null, user: null, manufacturers: [], powerData: [] });
          localStorage.removeItem("zustand_live_store");
          set({ loading: false });
        }
      },

      fetchManufacturers: async () => {
        set({ loading: true, error: null });
        try {
          const list = await manufacturerService.findAll();
          set({ manufacturers: list });
        } catch (e: any) {
          set({ error: e?.message || "Failed to fetch manufacturers" });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      fetchPowerData: async (manufacturerId) => {
        set({ loading: true, error: null });
        try {
          const list = manufacturerId
            ? await powerDataService.getPowerDataByManufacturer(manufacturerId)
            : await powerDataService.getPowerData();
          set({ powerData: list });
        } catch (e: any) {
          set({ error: e?.message || "Failed to fetch power data" });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      addManufacturer: (manufacturer) => {
        set((state) => ({ manufacturers: [...state.manufacturers, manufacturer] }));
      },

      updateManufacturer: (manufacturer) => {
        set((state) => ({
          manufacturers: state.manufacturers.map((item) =>
            item.id === manufacturer.id ? manufacturer : item
          ),
        }));
      },

      removeManufacturer: (id) => {
        set((state) => ({
          manufacturers: state.manufacturers.filter((item) => item.id !== id),
        }));
      },

      addPowerData: (payload) => {
        set((state) => ({ powerData: [payload, ...state.powerData] }));
      },

      updatePowerData: (payload) => {
        set((state) => ({
          powerData: state.powerData.map((item) =>
            item.id === payload.id ? payload : item
          ),
        }));
      },

      removePowerData: (id) => {
        set((state) => ({
          powerData: state.powerData.filter((item) => item.id !== id),
        }));
      },

      createPowerData: async (payload) => {
        set({ loading: true, error: null });
        try {
          const created = await powerDataService.createPowerData(payload);
          set({ powerData: [created, ...get().powerData] });
        } catch (e: any) {
          set({ error: e?.message || "Failed to create power data" });
          throw e;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "zustand_live_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useLiveStore;
