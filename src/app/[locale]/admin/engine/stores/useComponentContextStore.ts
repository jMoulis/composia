// builder/stores/componentContextStore.ts
import { create } from 'zustand';

interface ComponentContextStore {
  routeParams?: Record<string, string>;
  globalProvides: Record<string, any>;

  setRouteParams: (params: Record<string, string>) => void;
  setProvides: (provides: Record<string, any>) => void;
  clear: () => void;
}

export const useComponentContextStore = create<ComponentContextStore>((set) => ({
  globalProvides: {},

  setRouteParams: (routeParams) =>
    set((state) => ({
      globalProvides: { ...state.globalProvides, routeParams }
    })),
  setProvides: (provides) => set((state) => ({
    globalProvides: { ...state.globalProvides, ...provides }
  })),
  clear: () => set({ routeParams: {}, globalProvides: {} })
}));
