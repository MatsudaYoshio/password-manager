import { PayloadAction, createSelector, createSlice, current } from '@reduxjs/toolkit';

import { Queue } from '../data_structures/queue';
import TreeNode from '../models/treeNode';

import { plainToInstance } from 'class-transformer';

// ノードをディープコピーする関数
const deepCloneNodes = (nodes: TreeNode[]): TreeNode[] => structuredClone(nodes);

// 共通のヘルパー関数
const findNodeById = (itemId: string, nodes: TreeNode[]): TreeNode | null => {
  const queue = new Queue<TreeNode>();
  nodes.forEach(node => queue.enqueue(node));

  while (!queue.isEmpty) {
    const node = queue.dequeue();
    if (node.id === itemId) {
      return node;
    }
    if (node.children) {
      node.children.forEach(child => queue.enqueue(child));
    }
  }
  return null;
};

const findParentNode = (itemId: string, nodes: TreeNode[]): TreeNode | null => {
  for (const node of nodes) {
    if (node.children) {
      for (const child of node.children) {
        if (child.id === itemId) {
          return node;
        }
        const parent = findParentNode(itemId, [child]);
        if (parent) {
          return parent;
        }
      }
    }
  }
  return null;
};

// 初期状態の型定義
export interface ItemSliceState {
  activeNode: TreeNode | null;
  itemCount: number;
  itemData: { main: TreeNode[]; staging: TreeNode[] };
  expandedItemIds: string[];
}

// アイテムスライスファクトリー関数
export const createItemSlice = (initialState: ItemSliceState) => {
  const createNewNode = (title: string) => {
    const newTreeNode = new TreeNode({ title, credentials: [] });
    // プレーンオブジェクトに変換
    return structuredClone(newTreeNode);
  };

  return createSlice({
    name: 'item',
    initialState,
    reducers: {
      switchActiveNodeById: (state, action: PayloadAction<string>) => {
        const queue = new Queue<TreeNode>();
        let foundNode: TreeNode | null = null;

        state.itemData.staging.forEach((node: TreeNode) => queue.enqueue(node));

        while (!queue.isEmpty) {
          const node = queue.dequeue();
          if (node.id === action.payload) {
            foundNode = node;
            break;
          } else {
            if (node.children) {
              for (const child of node.children) {
                queue.enqueue(child);
              }
            }
          }
        }
        state.activeNode = foundNode;
      },
      updateActiveNode: (state, action: PayloadAction<TreeNode | null>) => {
        state.activeNode = action.payload;
      },
      updateItem: (state, action: PayloadAction<TreeNode>) => {
        const targetNode = findNodeById(action.payload.id, state.itemData.staging);
        if (targetNode) {
          targetNode.data = action.payload.data;
        }
      },
      addNewTopItem: state => {
        const newNode = createNewNode(`item${state.itemCount}`);
        state.itemData.staging.push(newNode);
        state.itemCount++;
        state.activeNode = newNode;
      },
      addNewSubItemById: (state, action: PayloadAction<string>) => {
        const targetNode = findNodeById(action.payload, state.itemData.staging);
        if (targetNode) {
          if (!targetNode.children) {
            targetNode.children = [];
          }
          const newNode = createNewNode(`item${state.itemCount}`);
          targetNode.children.push(newNode);
          state.itemCount++;
          state.activeNode = newNode;
        }
      },
      RemoveItemAndChildById: (state, action: PayloadAction<string>) => {
        const itemIdToDelete = action.payload;
        const parentNode = findParentNode(itemIdToDelete, state.itemData.staging);

        // ルートレベルから削除を試みる
        const rootIndex = state.itemData.staging.findIndex(node => node.id === itemIdToDelete);
        if (rootIndex !== -1) {
          state.itemData.staging.splice(rootIndex, 1);
          state.activeNode = state.itemData.staging.length > 0 ? state.itemData.staging[0] : null;
          return;
        }

        // 親ノードの子から削除
        if (parentNode && parentNode.children) {
          const childIndex = parentNode.children.findIndex(child => child.id === itemIdToDelete);
          if (childIndex !== -1) {
            parentNode.children.splice(childIndex, 1);
            state.activeNode = parentNode;
          }
        }
      },
      updateMainState: state => {
        state.itemData.main = deepCloneNodes(current(state.itemData.staging));
      },
      updateStagingData: (state, action: PayloadAction<TreeNode[]>) => {
        state.itemData.staging = deepCloneNodes(action.payload);
      },
      setExpandedItemIds: (state, action: PayloadAction<string[]>) => {
        state.expandedItemIds = action.payload;
      }
    }
  });
};

// セレクター
const itemData = (state: { item: { itemData: { main: TreeNode[]; staging: TreeNode[] } } }) =>
  state.item.itemData;
export const hasDifferenceBetweenMainAndStaging = createSelector([itemData], itemData => {
  return JSON.stringify(itemData.main) !== JSON.stringify(itemData.staging);
});
export const stagingItemData = createSelector([itemData], itemData => itemData.staging);

// 本番用の初期化関数
const getInitialNodes = async (): Promise<TreeNode[]> => {
  const rawNodes = await window.api.readNodes();
  const nodes = plainToInstance(TreeNode, rawNodes);
  // プレーンなオブジェクトに変換してImmerが正しく動作するようにする
  return deepCloneNodes(nodes);
};

const getInitialExpandedItemIds = async (): Promise<string[]> =>
  await window.api.getTreeViewExpandedItems();
const getInitialSelectedItemId = async (): Promise<string | undefined> =>
  await window.api.getTreeViewSelectedItemId();

// 本番用の初期状態を作成
const createProductionInitialState = async (): Promise<ItemSliceState> => {
  const initialNodes = await getInitialNodes();
  const initialExpandedItemIds = await getInitialExpandedItemIds();
  const initialSelectedItemId = await getInitialSelectedItemId();

  const initialActiveNode: TreeNode | null = initialSelectedItemId
    ? findNodeById(initialSelectedItemId, initialNodes)
    : initialNodes && initialNodes.length > 0
      ? initialNodes[0]
      : null;

  // mainとstagingは別々のコピーを持つ
  return {
    activeNode: initialActiveNode,
    itemCount: 1,
    itemData: {
      main: deepCloneNodes(initialNodes),
      staging: initialNodes
    },
    expandedItemIds: initialExpandedItemIds
  };
};

// デフォルトスライス（テスト用）
const defaultSlice = createItemSlice({
  activeNode: null,
  itemCount: 1,
  itemData: { main: [], staging: [] },
  expandedItemIds: []
});

// 初期化関数をエクスポート
export { createProductionInitialState };
export const itemActions = defaultSlice.actions;
export default defaultSlice;
