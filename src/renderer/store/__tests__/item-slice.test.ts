import { configureStore } from '@reduxjs/toolkit';
import { createItemSlice, ItemSliceState } from '../item-slice';
import { itemListeners } from '../item-listeners';
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
  let itemSlice: ReturnType<typeof createItemSlice>;

  beforeEach(() => {
    // 各テスト前にテスト用の初期状態を作成
    const testInitialState: ItemSliceState = {
      activeNode: null,
      itemCount: 1,
      itemData: {
        main: [],
        staging: []
      },
      expandedItemIds: []
    };

    // テスト用のスライスを作成
    itemSlice = createItemSlice(testInitialState);

    store = configureStore({
      reducer: {
        item: itemSlice.reducer
      },
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false
        }).prepend(itemListeners.middleware)
    });

    // モックをリセット
    jest.clearAllMocks();
  });

  test('should handle addNewTopItem', () => {
    const initialState = (store.getState() as RootState).item;
    expect(initialState.itemData.staging).toHaveLength(0);

    store.dispatch(itemSlice.actions.addNewTopItem());

    const newState = (store.getState() as RootState).item;
    expect(newState.itemData.staging).toHaveLength(1);
    expect(newState.itemData.staging[0].data.title).toBe('item1');
    expect(newState.itemCount).toBe(2);
  });

  test('should handle switchActiveNodeById', async () => {
    // まずアイテムを追加
    store.dispatch(itemSlice.actions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    const nodeId = state.itemData.staging[0].id;

    // アクティブノードを切り替え
    store.dispatch(itemSlice.actions.switchActiveNodeById(nodeId));

    const newState = (store.getState() as RootState).item;
    expect(newState.activeNode?.id).toBe(nodeId);

    // リスナーミドルウェアの非同期処理を待つ
    await Promise.resolve();
    expect(mockApi.saveTreeViewSelectedItemId).toHaveBeenCalledWith(nodeId);
  });

  test('should handle updateActiveNode', async () => {
    const testNode = new TreeNode({
      title: 'Test Node',
      credentials: []
    });

    store.dispatch(itemSlice.actions.updateActiveNode(testNode));

    const state = (store.getState() as RootState).item;
    expect(state.activeNode).toBe(testNode);

    // リスナーミドルウェアの非同期処理を待つ
    await Promise.resolve();
    expect(mockApi.saveTreeViewSelectedItemId).toHaveBeenCalledWith(testNode.id);
  });

  test('should handle setExpandedItemIds', async () => {
    const expandedIds = ['id1', 'id2', 'id3'];

    store.dispatch(itemSlice.actions.setExpandedItemIds(expandedIds));

    const state = (store.getState() as RootState).item;
    expect(state.expandedItemIds).toEqual(expandedIds);

    // リスナーミドルウェアの非同期処理を待つ
    await Promise.resolve();
    expect(mockApi.saveTreeViewExpandedItems).toHaveBeenCalledWith(expandedIds);
  });

  test('should handle addNewSubItemById', () => {
    // 親アイテムを追加
    store.dispatch(itemSlice.actions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    const parentId = state.itemData.staging[0].id;

    // 子アイテムを追加
    store.dispatch(itemSlice.actions.addNewSubItemById(parentId));

    const newState = (store.getState() as RootState).item;
    const parentNode = newState.itemData.staging[0];

    expect(parentNode.children).toBeDefined();
    expect(parentNode.children).toHaveLength(1);
    expect(parentNode.children![0].data.title).toBe('item2');
  });

  test('should handle RemoveItemAndChildById', () => {
    // アイテムを追加
    store.dispatch(itemSlice.actions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    const nodeId = state.itemData.staging[0].id;

    // アイテムを削除
    store.dispatch(itemSlice.actions.RemoveItemAndChildById(nodeId));

    const newState = (store.getState() as RootState).item;
    expect(newState.itemData.staging).toHaveLength(0);
    expect(newState.activeNode).toBeNull();
  });

  test('should handle updateItem', () => {
    // アイテムを追加
    store.dispatch(itemSlice.actions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    const nodeToUpdate = state.itemData.staging[0];

    // アイテムを更新
    const updatedNode = {
      ...nodeToUpdate,
      data: {
        ...nodeToUpdate.data,
        title: 'Updated Title'
      }
    };

    store.dispatch(itemSlice.actions.updateItem(updatedNode));

    const newState = (store.getState() as RootState).item;
    expect(newState.itemData.staging[0].data.title).toBe('Updated Title');
  });

  test('should handle updateMainState', () => {
    // アイテムを追加
    store.dispatch(itemSlice.actions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    expect(state.itemData.main).toHaveLength(0);
    expect(state.itemData.staging).toHaveLength(1);

    // mainをstagingで更新
    store.dispatch(itemSlice.actions.updateMainState());

    const newState = (store.getState() as RootState).item;
    expect(newState.itemData.main).toHaveLength(1);
    expect(newState.itemData.main[0].data.title).toBe('item1');
    // mainとstagingは別のオブジェクトであることを確認
    expect(newState.itemData.main).not.toBe(newState.itemData.staging);
  });

  test('should handle updateStagingData', () => {
    const newData = [
      new TreeNode({ title: 'Test Item 1', credentials: [] }),
      new TreeNode({ title: 'Test Item 2', credentials: [] })
    ];

    store.dispatch(itemSlice.actions.updateStagingData(newData));

    const state = (store.getState() as RootState).item;
    expect(state.itemData.staging).toHaveLength(2);
    expect(state.itemData.staging[0].data.title).toBe('Test Item 1');
    expect(state.itemData.staging[1].data.title).toBe('Test Item 2');
  });

  test('should create plain objects for new items', () => {
    // アイテムを追加
    store.dispatch(itemSlice.actions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    const newNode = state.itemData.staging[0];

    // プレーンオブジェクトであることを確認
    expect(newNode.constructor.name).toBe('Object');
    expect(Object.isExtensible(newNode)).toBe(true);
  });

  test('should handle nested item removal', () => {
    // 親アイテムを追加
    store.dispatch(itemSlice.actions.addNewTopItem());

    const state = (store.getState() as RootState).item;
    const parentId = state.itemData.staging[0].id;

    // 子アイテムを追加
    store.dispatch(itemSlice.actions.addNewSubItemById(parentId));

    const stateWithChild = (store.getState() as RootState).item;
    const childId = stateWithChild.itemData.staging[0].children![0].id;

    // 子アイテムを削除
    store.dispatch(itemSlice.actions.RemoveItemAndChildById(childId));

    const newState = (store.getState() as RootState).item;
    expect(newState.itemData.staging[0].children).toHaveLength(0);
    // 親がアクティブノードになることを確認
    expect(newState.activeNode?.id).toBe(parentId);
  });
});
