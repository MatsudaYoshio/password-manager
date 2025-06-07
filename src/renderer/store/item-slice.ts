import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";

import { Queue } from "../data_structures/queue";
import TreeNode from "../models/treeNode";

import { plainToInstance } from "class-transformer";

const getInitialNodes = async (): Promise<TreeNode[]> => plainToInstance(TreeNode, await (window as any).api.readNodes());

const initialNodes = await getInitialNodes();

// Helper function to find the parent of a node
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

const initialState: { activeNode: TreeNode; itemCount: number; itemData: { main: TreeNode[]; staging: TreeNode[] } } = {
  activeNode: {} as TreeNode,
  itemCount: 1,
  itemData: {
    main: initialNodes,
    staging: initialNodes,
  },
};

const addNewItem = (itemData: TreeNode[], title: string): void => {
  const newTreeNode = new TreeNode({ title, credentials: [] });
  if (!Object.isExtensible(itemData)) {
    itemData = [...itemData];
  }
  itemData.push(newTreeNode);
  itemSlice.actions.switchActiveNodeById(newTreeNode.id);
};

const itemData = (state: { item: { itemData: { main: TreeNode[]; staging: TreeNode[] } } }) => state.item.itemData;
export const hasDifferenceBetweenMainAndStaging = createSelector([itemData], (itemData) => {
  return JSON.stringify(itemData.main) !== JSON.stringify(itemData.staging);
});
export const stagingItemData = createSelector([itemData], (itemData) => itemData.staging);

const itemSlice = createSlice({
  name: "item",
  initialState: {
    activeNode: initialState.itemData.staging[0],
    itemCount: initialState.itemCount,
    itemData: structuredClone(initialState.itemData),
  },
  reducers: {
    switchActiveNodeById: (state, action: PayloadAction<string>) => {
      const queue = new Queue<TreeNode>();

      state.itemData.staging.forEach((node) => queue.enqueue(node));

      while (!queue.isEmpty) {
        const node = queue.dequeue();
        if (node.id === action.payload) {
          state.activeNode = node;
          return;
        } else {
          // IDが一致しないなら子要素を探す
          if (node.children) {
            for (const child of node.children) {
              queue.enqueue(child);
            }
          }
        }
      }
    },
    updateActiveNode: (state, action: PayloadAction<TreeNode>) => {
      state.activeNode = action.payload;
    },
    updateItem: (state, action: PayloadAction<TreeNode>) => {
      const queue = new Queue<TreeNode>();
      const stagingCopy = state.itemData.staging.map((node) => ({ ...node }));
      stagingCopy.forEach((node) => queue.enqueue(node));

      while (!queue.isEmpty) {
        const node = queue.dequeue();
        if (node.id === action.payload.id) {
          // IDが一致したらその要素を差し替える
          node.data = action.payload.data;
          state.itemData.staging = stagingCopy;
          return;
        }
        // IDが一致しないなら子要素を探す
        if (node.children) {
          node.children.forEach((child) => queue.enqueue(child));
        }
      }
    },
    addNewTopItem: (state) => {
      addNewItem(state.itemData.staging, `item${state.itemCount++}`);
    },
    addNewSubItemById: (state, action: PayloadAction<string>) => {
      const queue = new Queue<TreeNode>();
      const stagingCopy = state.itemData.staging.map((node) => ({ ...node }));
      stagingCopy.forEach((node) => queue.enqueue(node));

      while (!queue.isEmpty) {
        const node = queue.dequeue();
        if (node.id === action.payload) {
          // IDが一致したらその子要素に追加する
          if (!node.children) {
            node.children = [];
          }
          addNewItem(node.children, `item${state.itemCount++}`);
          state.itemData.staging = stagingCopy;
          return;
        }
        // IDが一致しないなら子要素を探す
        if (node.children) {
          node.children.forEach((child) => queue.enqueue(child));
        }
      }
    },
    RemoveItemAndChildById: (state, action: PayloadAction<string>) => {
      const itemIdToDelete = action.payload;
      const parentNode = findParentNode(itemIdToDelete, state.itemData.staging);

      const queue = new Queue<{ nodes: TreeNode[]; index: number }>();
      const stagingCopy = state.itemData.staging.map((node) => ({ ...node }));
      for (let i = 0; i < stagingCopy.length; i++) {
        queue.enqueue({ nodes: stagingCopy, index: i });
      }

      let itemRemoved = false;
      while (!queue.isEmpty) {
        const { nodes, index } = queue.dequeue();
        if (nodes[index].id === itemIdToDelete) {
          // IDが一致したらその要素と子要素を削除する
          nodes.splice(index, 1);
          state.itemData.staging = stagingCopy;
          itemRemoved = true;
          break;
        } else {
          // IDが一致しないなら子要素を探す
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
          if (state.itemData.staging.length > 0) {
            state.activeNode = state.itemData.staging[0];
          } else {
            state.activeNode = {} as TreeNode;
          }
        }
      }
    },
    updateMainState: (state) => {
      state.itemData.main = state.itemData.staging;
    },
    updateStagingData: (state, action: PayloadAction<TreeNode[]>) => {
      state.itemData.staging = action.payload;
    },
  },
});

export const itemActions = itemSlice.actions;

export default itemSlice;
