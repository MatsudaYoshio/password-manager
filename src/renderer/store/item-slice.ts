import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import { Queue } from '../data_structures/queue';
import TreeNode from '../models/treeNode';

import { plainToInstance } from 'class-transformer';

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
  const addNewItem = (itemData: TreeNode[], title: string): TreeNode => {
    const newTreeNode = new TreeNode({ title, credentials: [] });
    itemData.push(newTreeNode);
    return newTreeNode;
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
        const queue = new Queue<TreeNode>();
        const stagingCopy = state.itemData.staging.map((node: TreeNode) => ({ ...node }));
        stagingCopy.forEach((node: TreeNode) => queue.enqueue(node));

        while (!queue.isEmpty) {
          const node = queue.dequeue();
          if (node.id === action.payload.id) {
            node.data = action.payload.data;
            state.itemData.staging = stagingCopy;
            return;
          }
          if (node.children) {
            node.children.forEach(child => queue.enqueue(child));
          }
        }
      },
      addNewTopItem: state => {
        const newNode = addNewItem(state.itemData.staging, `item${state.itemCount}`);
        state.itemCount++;
        state.activeNode = newNode;
      },
      addNewSubItemById: (state, action: PayloadAction<string>) => {
        const queue = new Queue<TreeNode>();
        const stagingCopy = state.itemData.staging.map((node: TreeNode) => ({ ...node }));
        stagingCopy.forEach((node: TreeNode) => queue.enqueue(node));

        while (!queue.isEmpty) {
          const node = queue.dequeue();
          if (node.id === action.payload) {
            if (!node.children) {
              node.children = [];
            }
            const newNode = addNewItem(node.children, `item${state.itemCount}`);
            state.itemCount++;
            state.itemData.staging = stagingCopy;
            state.activeNode = newNode;
            return;
          }
          if (node.children) {
            node.children.forEach(child => queue.enqueue(child));
          }
        }
      },
      RemoveItemAndChildById: (state, action: PayloadAction<string>) => {
        const itemIdToDelete = action.payload;
        const parentNode = findParentNode(itemIdToDelete, state.itemData.staging);

        const queue = new Queue<{ nodes: TreeNode[]; index: number }>();
        const stagingCopy = state.itemData.staging.map((node: TreeNode) => ({ ...node }));
        for (let i = 0; i < stagingCopy.length; i++) {
          queue.enqueue({ nodes: stagingCopy, index: i });
        }

        let itemRemoved = false;
        while (!queue.isEmpty) {
          const { nodes, index } = queue.dequeue();
          if (nodes[index].id === itemIdToDelete) {
            nodes.splice(index, 1);
            state.itemData.staging = stagingCopy;
            itemRemoved = true;
            break;
          } else {
            const children = nodes[index].children;
            if (children) {
              for (let i = 0; i < children.length; i++) {
                queue.enqueue({ nodes: children, index: i });
              }
            }
          }
        }

        if (itemRemoved) {
          if (parentNode) {
            state.activeNode = parentNode;
          } else {
            state.activeNode = state.itemData.staging.length > 0 ? state.itemData.staging[0] : null;
          }
        }
      },
      updateMainState: state => {
        state.itemData.main = state.itemData.staging;
      },
      updateStagingData: (state, action: PayloadAction<TreeNode[]>) => {
        state.itemData.staging = action.payload;
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
const getInitialNodes = async (): Promise<TreeNode[]> =>
  plainToInstance(TreeNode, await window.api.readNodes());
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

  return {
    activeNode: initialActiveNode,
    itemCount: 1,
    itemData: {
      main: initialNodes,
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
