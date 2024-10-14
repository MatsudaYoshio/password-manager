import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { uuidv7 } from "uuidv7";

import Credential from "../models/credential";
import TreeNode from "../models/treeNode";
import { Queue } from "../data_structures/queue";
import TreeNodeData from "../models/treeNodeData";

const rootNodeId: string = `0-${uuidv7()}`;

const SAMPLE_DATA = [
  {
    id: rootNodeId,
    data: {
      title: "Seasons",
      credentials: [],
    },
    children: [
      {
        id: `${uuidv7()}`,
        data: {
          title: "Summer",
          credentials: [new Credential({ name: "sample", value: "abc" })],
        },
        children: [
          {
            id: `${uuidv7()}`,
            data: {
              title: "Hot",
              credentials: [],
            },
            children: [
              {
                id: `${uuidv7()}`,
                data: {
                  title: "June",
                  credentials: [
                    {
                      id: uuidv7(),
                      name: uuidv7(),
                      value: "abc",
                      showValue: false,
                      description: "sample",
                    },
                  ],
                },
              },
              {
                id: `${uuidv7()}`,
                data: {
                  title: "7月",
                  credentials: [],
                },
              },
            ],
          },
          {
            id: `${uuidv7()}`,
            data: {
              title: "August",
              credentials: [],
            },
          },
        ],
      },
      {
        id: `${uuidv7()}`,
        data: {
          title: "Fall",
          credentials: [],
        },
        children: [
          {
            id: `${uuidv7()}`,
            data: {
              title: "September",
              credentials: [],
            },
          },
          {
            id: `${uuidv7()}`,
            data: {
              title: "October",
              credentials: [],
            },
          },
          {
            id: `${uuidv7()}`,
            data: {
              title: "November",
              credentials: [],
            },
          },
        ],
      },
    ],
  },
];

const initialState: { activeNode: TreeNode; itemCount: number; itemData: { main: TreeNode[]; staging: TreeNode[] } } = {
  activeNode: {} as TreeNode,
  itemCount: 1,
  itemData: {
    main: SAMPLE_DATA,
    staging: SAMPLE_DATA,
  },
};

const addNewItem = (itemData: TreeNode[], title: string): void => {
  const newTreeNode = new TreeNode({ title, credentials: [] });
  itemData.push(newTreeNode);
  itemSlice.actions.switchActiveNodeById(newTreeNode.id);
};

const itemSlice = createSlice({
  name: "item",
  initialState: {
    activeNode: initialState.itemData.staging[0],
    itemCount: initialState.itemCount,
    itemData: initialState.itemData,
  },
  reducers: {
    switchActiveNodeById: (state, action: PayloadAction<string>) => {
      const queue = new Queue<TreeNode>();
      for (const node of state.itemData.staging) {
        queue.enqueue(node);
      }

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
    commitActiveItem: (state) => {
      const queue = new Queue<TreeNode>();
      for (const node of state.itemData.staging) {
        queue.enqueue(node);
      }

      while (!queue.isEmpty) {
        const node = queue.dequeue();
        if (node.id === state.activeNode.id) {
          // IDが一致したらその要素を差し替える
          node.data = state.activeNode.data;
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

    addNewTopItem: (state) => {
      addNewItem(state.itemData.staging, `item${state.itemCount++}`);
    },
    addNewSubItemById: (state, action: PayloadAction<string>) => {
      const queue = new Queue<TreeNode>();
      const staging = state.itemData.staging.map((node) => ({ ...node }));

      for (const node of staging) {
        queue.enqueue(node);
      }

      while (!queue.isEmpty) {
        const node = queue.dequeue();
        if (node.id === action.payload) {
          // IDが一致したらその子要素に追加する
          if (!node.children) {
            node.children = [];
          }
          addNewItem(node.children, `item${state.itemCount++}`);
          state.itemData.staging = staging;
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
    RemoveItemAndChildById: (state, action: PayloadAction<string>) => {
      const queue = new Queue<{ nodes: TreeNode[]; index: number }>();
      const staging = state.itemData.staging.map((node) => ({ ...node }));
      for (let i = 0; i < staging.length; i++) {
        queue.enqueue({ nodes: staging, index: i });
      }

      while (!queue.isEmpty) {
        const { nodes, index } = queue.dequeue();
        if (nodes[index].id === action.payload) {
          // IDが一致したらその要素と子要素を削除する
          nodes.splice(index, 1);
          state.itemData.staging = staging;
          return;
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
    },
  },
});

export const itemActions = itemSlice.actions;

export default itemSlice;
