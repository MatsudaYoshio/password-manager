import { configureStore } from '@reduxjs/toolkit';
import itemSlice, { itemActions } from '../../../test/item-slice-mock-helper';
import TreeNode from '../../models/treeNode';

// window.apiのモック
const mockApi = {
  saveTreeViewSelectedItemId: jest.fn(),
  saveTreeViewExpandedItems: jest.fn()
};

Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
});

type RootState = {
  item: {
    activeNode: TreeNode | null;
    itemCount: number;
    itemData: { main: TreeNode[]; staging: TreeNode[] };
    expandedItemIds: string[];
  };
};

describe('item-slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // 各テスト前にストアを初期化
    const initialState = {
      activeNode: null,
      itemCount: 1,
      itemData: {
        main: [],
        staging: []
      },
      expandedItemIds: []
    };

    store = configureStore({
      reducer: {
        item: itemSlice.reducer
      },
      preloadedState: {
        item: initialState
      },
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false
        })
    });

    // モックをリセット
    jest.clearAllMocks();
  });

  test('should handle addNewTopItem', () => {
    const initialState = (store.getState() as RootState).item;
    expect(initialState.itemData.staging).toHaveLength(0);

    store.dispatch(itemActions.addNewTopItem());

    const newState = (store.getState() as RootState).item;
    expect(newState.itemData.staging).toHaveLength(1);
    expect(newState.itemData.staging[0].data.title).toBe('item1');
    expect(newState.itemCount).toBe(2);
  });

  test('should handle switchActiveNodeById', () => {
    // まずアイテムを追加
    store.dispatch(itemActions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    const nodeId = state.itemData.staging[0].id;

    // アクティブノードを切り替え
    store.dispatch(itemActions.switchActiveNodeById(nodeId));

    const newState = (store.getState() as RootState).item;
    expect(newState.activeNode?.id).toBe(nodeId);
    expect(mockApi.saveTreeViewSelectedItemId).toHaveBeenCalledWith(nodeId);
  });

  test('should handle updateActiveNode', () => {
    const testNode = new TreeNode({
      title: 'Test Node',
      credentials: []
    });

    store.dispatch(itemActions.updateActiveNode(testNode));

    const state = (store.getState() as RootState).item;
    expect(state.activeNode).toBe(testNode);
    expect(mockApi.saveTreeViewSelectedItemId).toHaveBeenCalledWith(testNode.id);
  });

  test('should handle setExpandedItemIds', () => {
    const expandedIds = ['id1', 'id2', 'id3'];

    store.dispatch(itemActions.setExpandedItemIds(expandedIds));

    const state = (store.getState() as RootState).item;
    expect(state.expandedItemIds).toEqual(expandedIds);
    expect(mockApi.saveTreeViewExpandedItems).toHaveBeenCalledWith(expandedIds);
  });

  test('should handle addNewSubItemById', () => {
    // 親アイテムを追加
    store.dispatch(itemActions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    const parentId = state.itemData.staging[0].id;

    // 子アイテムを追加
    store.dispatch(itemActions.addNewSubItemById(parentId));

    const newState = (store.getState() as RootState).item;
    const parentNode = newState.itemData.staging[0];

    expect(parentNode.children).toBeDefined();
    expect(parentNode.children).toHaveLength(1);
    expect(parentNode.children![0].data.title).toBe('item2');
  });

  test('should handle RemoveItemAndChildById', () => {
    // アイテムを追加
    store.dispatch(itemActions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    const nodeId = state.itemData.staging[0].id;

    // アイテムを削除
    store.dispatch(itemActions.RemoveItemAndChildById(nodeId));

    const newState = (store.getState() as RootState).item;
    expect(newState.itemData.staging).toHaveLength(0);
    expect(newState.activeNode).toBeNull();
  });
});
