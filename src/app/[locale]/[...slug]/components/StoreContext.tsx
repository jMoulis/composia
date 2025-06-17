'use client';

import { createContext, useContext } from 'react';
import { useRef } from 'react';
import { createStore, useStore } from 'zustand';
import {
  IResourceDefinition,
  IStoreDefinition
} from '../../admin/engine/interfaces';

const updateStore = (
  currentStore: IStoreDefinition,
  values: any,
  index?: number,
  action = 'update'
) => {
  if (typeof index === 'number' && Array.isArray(currentStore.data)) {
    if (action === 'delete') {
      return {
        ...currentStore,
        data: currentStore.data.filter((_, idx) => idx !== index)
      };
    }
    if (action === 'add') {
      return {
        ...currentStore,
        data: [...currentStore.data, values]
      };
    }
    const updatedData = currentStore.data.map((item, idx) =>
      idx === index ? { ...item, ...values } : item
    );
    return {
      ...currentStore,
      data: updatedData
    };
  }
  if (action === 'delete') {
    return {
      ...currentStore,
      data: null
    };
  }
  return {
    ...currentStore,
    data: { ...currentStore.data, ...values }
  };
};
type StoreProviderProps = React.PropsWithChildren<StoreProps>;

interface StoreProps {
  stores: Record<
    string,
    { data: any; storeKey: string; definition: IResourceDefinition | null }
  >;
}

interface StoreState extends StoreProps {
  updateStore: (
    storeKey: string,
    values: any,
    index?: number,
    action?: 'add' | 'update' | 'delete'
  ) => void;
  addToStore: (storeKey: string, values: any) => void;
}

const createStoresStore = (initProps?: Partial<StoreProps>) => {
  const DEFAULT_PROPS: StoreProps = {
    stores: {}
  };
  return createStore<StoreState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    addToStore: (storeKey, values) => {
      set((state) => {
        const initialStore = state.stores[storeKey] || { data: {}, storeKey };
        const updatedStore = {
          ...initialStore,
          data: { ...initialStore.data, ...values }
        };
        return {
          stores: {
            ...state.stores,
            [storeKey]: updatedStore
          }
        };
      });
    },
    updateStore: (storeKey, values, index, action) => {
      set((state) => {
        const initialStore = state.stores[storeKey] || { data: {}, storeKey };

        return {
          stores: {
            ...state.stores,
            [storeKey]: updateStore(initialStore, values, index, action)
          }
        };
      });
    }
  }));
};

type StoresStore = ReturnType<typeof createStoresStore>;

export const StoresContext = createContext<StoresStore | null>(null);

export function StoreProvider({ children, ...props }: StoreProviderProps) {
  const storeRef = useRef<StoresStore>(null);
  if (!storeRef.current) {
    storeRef.current = createStoresStore(props);
  }
  return (
    <StoresContext.Provider value={storeRef.current}>
      {children}
    </StoresContext.Provider>
  );
}

export function useStoresContext<T>(selector: (state: StoreState) => T): T {
  const store = useContext(StoresContext);
  if (!store) throw new Error('Missing StoresContext.Provider in the tree');
  return useStore(store, selector);
}
