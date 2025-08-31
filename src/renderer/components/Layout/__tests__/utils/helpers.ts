import React from 'react';
import { render, createTestStore } from '../../../../../test/test-utils';
import TreeNode from '../../../../models/treeNode';
import TreeNodeData from '../../../../models/treeNodeData';

/**
 * テスト用のTreeNodeを作成するヘルパー関数
 * @param data TreeNodeDataオブジェクト、nullの場合はランダムなデータを生成
 * @returns 作成されたTreeNode
 */
export const createTestNode = (data: TreeNodeData | null = null): TreeNode => {
  if (data === null) {
    const randomId = Math.random().toString(36).substring(2, 8);
    data = {
      title: `random-item-${randomId}`,
      credentials: []
    };
  }
  return new TreeNode(data);
};

/**
 * テスト用のReduxストアを作成するヘルパー関数
 */
export const createStoreWithItems = (
  stagingItems: TreeNode[] = [],
  mainItems: TreeNode[] = [],
  activeNode: TreeNode | null = null,
  expandedItemIds: string[] = []
) => {
  return createTestStore({
    item: {
      activeNode,
      itemCount: 1,
      itemData: {
        main: mainItems,
        staging: stagingItems
      },
      expandedItemIds
    }
  });
};

/**
 * コンポーネントをレンダリングするヘルパー関数（ストアも返す）
 */
export const renderWithStore = (
  Component: React.ComponentType<unknown>,
  stagingItems: TreeNode[] = [],
  mainItems: TreeNode[] = [],
  activeNode: TreeNode | null = null,
  expandedItemIds: string[] = []
) => {
  const store = createStoreWithItems(stagingItems, mainItems, activeNode, expandedItemIds);
  const renderResult = render(React.createElement(Component), { store });
  return { ...renderResult, store };
};

/**
 * 親子ノードを作成するヘルパー関数
 */
export const createParentChildNodes = (parentTitle = 'parent-item', childTitle = 'child-item') => {
  const parentNode = createTestNode({ title: parentTitle, credentials: [] });
  const childNode = createTestNode({ title: childTitle, credentials: [] });

  // 親ノードに子ノードを追加
  parentNode.children = [childNode];

  return { parentNode, childNode };
};
