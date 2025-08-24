import { configureStore } from '@reduxjs/toolkit';
import { createItemSlice, createProductionInitialState } from './item-slice';

// ストア管理
let currentStore: ReturnType<typeof configureStore> | null = null;

// デフォルトストアの作成
const createDefaultStore = () => {
  const defaultItemSlice = createItemSlice({
    activeNode: null,
    itemCount: 1,
    itemData: { main: [], staging: [] },
    expandedItemIds: []
  });

  return configureStore({
    reducer: {
      item: defaultItemSlice.reducer
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false
      })
  });
};

// 本番用ストアの初期化
const initializeProductionStore = async () => {
  if (typeof window === 'undefined' || !window.api) {
    return currentStore || createDefaultStore();
  }

  try {
    const productionInitialState = await createProductionInitialState();
    const itemSlice = createItemSlice(productionInitialState);

    currentStore = configureStore({
      reducer: {
        item: itemSlice.reducer
      },
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false
        })
    });

    return currentStore;
  } catch (error) {
    console.warn('Failed to initialize production store, using default store:', error);
    return currentStore || createDefaultStore();
  }
};

// 初期ストア（デフォルト）
const defaultStore = createDefaultStore();
currentStore = defaultStore;

export type RootState = ReturnType<typeof defaultStore.getState>;
export { initializeProductionStore };
export default currentStore;
