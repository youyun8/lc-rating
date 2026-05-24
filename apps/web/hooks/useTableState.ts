import { STORAGE_VERSION } from "@/config/constants";
import { TableState } from "@tanstack/react-table";
import { create, StoreApi, useStore } from "zustand";
import { persist } from "zustand/middleware";

type TableStateHook<S> = {
  useTableState: () => S;
  setState: StoreApi<S>["setState"];
};

type CreatePersistedStoreOptions<S extends Partial<TableState>> = {
  key: string;
  initialState: S;
};

export function createTableStore<S extends Partial<TableState>>(
  options: CreatePersistedStoreOptions<S>,
): TableStateHook<S> {
  const store = create<S>()(
    persist(
      () => ({
        ...options.initialState,
      }),
      {
        name: options.key,
        version: STORAGE_VERSION,
        partialize: (state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { pagination, ...rest } = state;
          return rest;
        },
      },
    ),
  );

  return {
    useTableState: () => useStore(store),
    setState: store.setState,
  };
}
