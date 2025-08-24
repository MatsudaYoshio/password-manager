import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import itemSlice from '../renderer/store/item-slice';
import TreeNode from '../renderer/models/treeNode';

// テスト用のストア作成関数
export const createTestStore = (initialState = {}) => {
  // テスト用のデフォルト状態
  const defaultState = {
    item: {
      activeNode: null,
      itemCount: 1,
      itemData: {
        main: [] as TreeNode[],
        staging: [] as TreeNode[]
      },
      expandedItemIds: [] as string[]
    }
  };

  return configureStore({
    reducer: {
      item: itemSlice.reducer
    },
    preloadedState: { ...defaultState, ...initialState },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false
      })
  });
};

// テスト用のテーマ
const testTheme = createTheme();

// カスタムレンダー関数
const AllTheProviders = ({
  children,
  store = createTestStore()
}: {
  children: React.ReactNode;
  store?: ReturnType<typeof createTestStore>;
}) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    store?: ReturnType<typeof createTestStore>;
  }
) => {
  const { store, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: props => <AllTheProviders {...props} store={store} />,
    ...renderOptions
  });
};

export * from '@testing-library/react';
export { customRender as render };
