import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DashboardStore {
  idm: number;
  season: number;
  setIdm: (idm: number) => void;
  setSeason: (season: number) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      idm: 0,
      season: 0,
      setIdm: (idm) => set({ idm, season: 0 }),
      setSeason: (season) => set({ season }),
    }),
    {
      name: 'gpro-dashboard',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ idm: state.idm }),
    }
  )
);
