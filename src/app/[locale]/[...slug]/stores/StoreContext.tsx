'use client';

import { createContext, useContext } from 'react';
import { useRef } from 'react';
import { createStore, useStore } from 'zustand';
import {
  IResourceDefinition,
  IStoreDefinition
} from '../../admin/engine/interfaces';

type DataType = 'object' | 'array' | 'primitive';
type CrudAction = 'set' | 'update' | 'add' | 'delete';

export const updateStore = (
  currentStore: IStoreDefinition,
  values: any,
  action: CrudAction = 'update',
  dataType: DataType = 'object',
  index?: number
): IStoreDefinition => {
  const currentData = currentStore.data;

  if (dataType === 'array') {
    const arrayData = Array.isArray(currentData) ? currentData : [];

    switch (action) {
      case 'add':
        return {
          ...currentStore,
          data: [...arrayData, values]
        };

      case 'delete':
        if (typeof index !== 'number') return currentStore;
        return {
          ...currentStore,
          data: arrayData.filter((_, i) => i !== index)
        };

      case 'update':
        if (typeof index !== 'number') return currentStore;
        return {
          ...currentStore,
          data: arrayData.map((item, i) =>
            i === index
              ? typeof item === 'object' && typeof values === 'object'
                ? { ...item, ...values }
                : values
              : item
          )
        };

      case 'set':
        return {
          ...currentStore,
          data: values
        };
    }
  }

  if (dataType === 'object') {
    switch (action) {
      case 'set':
        return {
          ...currentStore,
          data: values
        };
      case 'update':
        return {
          ...currentStore,
          data: {
            ...currentData,
            ...values
          }
        };
      case 'delete':
        return {
          ...currentStore,
          data: null
        };
    }
  }

  if (dataType === 'primitive') {
    switch (action) {
      case 'set':
        return {
          ...currentStore,
          data: values
        };
      case 'delete':
        return {
          ...currentStore,
          data: null
        };
    }
  }

  return currentStore;
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
    action: CrudAction,
    dataType: DataType,
    index?: number
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
    updateStore: (storeKey, values, action, dataType, index) => {
      set((state) => {
        const initialStore = state.stores[storeKey] || { data: {}, storeKey };

        return {
          stores: {
            ...state.stores,
            [storeKey]: updateStore(
              initialStore,
              values,
              action,
              dataType,
              index
            )
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
