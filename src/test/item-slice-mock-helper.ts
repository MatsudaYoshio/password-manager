import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { Queue } from '../renderer/data_structures/queue';
import TreeNode from '../renderer/models/treeNode';

// テスト用のitem-slice（top-level awaitを使わない版）

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

const initialState: {
  activeNode: TreeNode | null;
  itemCount: number;
  itemData: { main: TreeNode[]; staging: TreeNode[] };
  expandedItemIds: string[];
} = {
  activeNode: null,
  itemCount: 1,
  itemData: {
    main: [],
    staging: []
  },
  expandedItemIds: []
};

const addNewItem = (itemData: TreeNode[], title: string, _itemCount: number): TreeNode => {
  const newTreeNode = new TreeNode({ title, credentials: [] });
  if (!Object.isExtensible(itemData)) {
    itemData = [...itemData];
  }
  itemData.push(newTreeNode);
  return newTreeNode;
};

const itemData = (state: { item: { itemData: { main: TreeNode[]; staging: TreeNode[] } } }) =>
  state.item.itemData;
export const hasDifferenceBetweenMainAndStaging = createSelector([itemData], itemData => {
  return JSON.stringify(itemData.main) !== JSON.stringify(itemData.staging);
});
export const stagingItemData = createSelector([itemData], itemData => itemData.staging);

const itemSlice = createSlice({
  name: 'item',
  initialState,
  reducers: {
    switchActiveNodeById: (state, action: PayloadAction<string>) => {
      const queue = new Queue<TreeNode>();
      let foundNode: TreeNode | null = null;

      state.itemData.staging.forEach(node => queue.enqueue(node));

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
      if (window.api) {
        window.api.saveTreeViewSelectedItemId(state.activeNode ? state.activeNode.id : null);
      }
    },
    updateActiveNode: (state, action: PayloadAction<TreeNode | null>) => {
      state.activeNode = action.payload;
      if (window.api) {
        window.api.saveTreeViewSelectedItemId(state.activeNode ? state.activeNode.id : null);
      }
    },
    updateItem: (state, action: PayloadAction<TreeNode>) => {
      const queue = new Queue<TreeNode>();
      const stagingCopy = state.itemData.staging.map(node => ({ ...node }));
      stagingCopy.forEach(node => queue.enqueue(node));

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
      const newNode = addNewItem(state.itemData.staging, `item${state.itemCount}`, state.itemCount);
      state.itemCount++;
      state.activeNode = newNode;
    },
    addNewSubItemById: (state, action: PayloadAction<string>) => {
      const queue = new Queue<TreeNode>();
      const stagingCopy = state.itemData.staging.map(node => ({ ...node }));
      stagingCopy.forEach(node => queue.enqueue(node));

      while (!queue.isEmpty) {
        const node = queue.dequeue();
        if (node.id === action.payload) {
          if (!node.children) {
            node.children = [];
          }
          const newNode = addNewItem(node.children, `item${state.itemCount}`, state.itemCount);
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
      const stagingCopy = state.itemData.staging.map(node => ({ ...node }));
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
        if (window.api) {
          window.api.saveTreeViewSelectedItemId(state.activeNode ? state.activeNode.id : null);
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
      if (window.api) {
        window.api.saveTreeViewExpandedItems(state.expandedItemIds);
      }
    }
  }
});

export const itemActions = itemSlice.actions;
export default itemSlice;
