import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemTreeView from '../ItemTreeView';
import TreeNode from '../../../models/treeNode';
import {
  createTestNode,
  renderWithStore,
  createParentChildNodes,
  createStoreWithItems,
  getActiveNode
} from './utils/helpers';

describe('ItemTreeView', () => {
  // ストアの状態から展開されたアイテムIDsを取得するヘルパー関数
  const getExpandedItemIds = (store: ReturnType<typeof createStoreWithItems>) => {
    return store.getState().item.expandedItemIds;
  };

  const renderItemTreeView = (
    stagingItems: TreeNode[] = [],
    activeNode: TreeNode | null = null,
    expandedItemIds: string[] = []
  ) => {
    return renderWithStore(ItemTreeView, stagingItems, [], activeNode, expandedItemIds);
  };

  it('renders empty tree view when no items', () => {
    renderItemTreeView();

    // RichTreeViewが正常にレンダリングされることを確認
    const treeView = screen.getByRole('tree');
    expect(treeView).toBeInTheDocument();
  });

  it('renders tree with single item', () => {
    const testNode = createTestNode({ title: 'test-item', credentials: [] });
    renderItemTreeView([testNode]);

    // ツリーアイテムが表示されることを確認
    expect(screen.getByText('test-item')).toBeInTheDocument();
  });

  it('renders tree with multiple items', () => {
    const testNode1 = createTestNode({ title: 'first-item', credentials: [] });
    const testNode2 = createTestNode({ title: 'second-item', credentials: [] });
    const testNode3 = createTestNode({ title: 'third-Item', credentials: [] });

    renderItemTreeView([testNode1, testNode2, testNode3]);

    // 複数のツリーアイテムが表示されることを確認
    expect(screen.getByText('first-item')).toBeInTheDocument();
    expect(screen.getByText('second-item')).toBeInTheDocument();
    expect(screen.getByText('third-Item')).toBeInTheDocument();
  });

  it('renders tree with nested items when expanded', () => {
    const { parentNode } = createParentChildNodes();

    // 親ノードを展開状態にする
    renderItemTreeView([parentNode], null, [parentNode.id]);

    // 親と子のアイテムが表示されることを確認
    expect(screen.getByText('parent-item')).toBeInTheDocument();
    expect(screen.getByText('child-item')).toBeInTheDocument();
  });

  it('renders tree with nested items when collapsed', () => {
    const { parentNode } = createParentChildNodes();

    renderItemTreeView([parentNode]);

    // 親アイテムのみ表示され、子アイテムは表示されないことを確認
    expect(screen.getByText('parent-item')).toBeInTheDocument();
    expect(screen.queryByText('child-item')).not.toBeInTheDocument();
  });

  describe('item interactions', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('changes active node when item is clicked', async () => {
      const testNode1 = createTestNode({ title: 'first-item', credentials: [] });
      const testNode2 = createTestNode({ title: 'second-item', credentials: [] });
      const { store } = renderItemTreeView([testNode1, testNode2]);

      // 初期状態ではアクティブノードがないことを確認
      expect(getActiveNode(store)?.id || null).toBeNull();

      // 最初のアイテムをクリック
      const firstItem = screen.getByText('first-item');
      await user.click(firstItem);

      // アクティブノードが変更されることを確認
      expect(getActiveNode(store)?.id).toBe(testNode1.id);

      // 2番目のアイテムをクリック
      const secondItem = screen.getByText('second-item');
      await user.click(secondItem);

      // アクティブノードが2番目のアイテムに変更されることを確認
      expect(getActiveNode(store)?.id).toBe(testNode2.id);
    });

    it('changes active node when nested item is clicked', async () => {
      const { parentNode, childNode } = createParentChildNodes();
      const { store } = renderItemTreeView([parentNode], null, [parentNode.id]);

      // 初期状態ではアクティブノードがないことを確認
      expect(getActiveNode(store)?.id || null).toBeNull();

      // 子アイテムをクリック
      const childItem = screen.getByText('child-item');
      await user.click(childItem);

      // アクティブノードが子ノードに変更されることを確認
      expect(getActiveNode(store)?.id).toBe(childNode.id);

      // 親アイテムをクリック
      const parentItem = screen.getByText('parent-item');
      await user.click(parentItem);

      // アクティブノードが親ノードに変更されることを確認
      expect(getActiveNode(store)?.id).toBe(parentNode.id);
    });

    it('maintains active node selection when same item is clicked multiple times', async () => {
      const testNode = createTestNode({ title: 'test-item', credentials: [] });
      const { store } = renderItemTreeView([testNode]);

      const testItem = screen.getByText('test-item');

      // 最初のクリック
      await user.click(testItem);
      expect(getActiveNode(store)?.id).toBe(testNode.id);

      // 同じアイテムを再度クリック
      await user.click(testItem);
      expect(getActiveNode(store)?.id).toBe(testNode.id);
    });

    it('updates expanded state when item is expanded by user click', async () => {
      const { parentNode } = createParentChildNodes();
      const { store } = renderItemTreeView([parentNode]);

      // 初期状態では展開されていないことを確認
      expect(getExpandedItemIds(store)).toEqual([]);
      expect(screen.queryByText('child-item')).not.toBeInTheDocument();

      // 親アイテムのツリーアイテムを取得
      const parentTreeItem = screen.getByRole('treeitem', { name: 'parent-item' });

      // 展開アイコン（アイコンコンテナ）をクリック
      const iconContainer = parentTreeItem.querySelector('.MuiTreeItem-iconContainer');
      expect(iconContainer).toBeInTheDocument();

      await user.click(iconContainer!);

      // 展開状態がストアに保存されることを確認
      expect(getExpandedItemIds(store)).toContain(parentNode.id);

      // 子アイテムが表示されることを確認
      expect(screen.getByText('child-item')).toBeInTheDocument();
    });

    it('updates expanded state when item is collapsed by user click', async () => {
      const { parentNode } = createParentChildNodes();
      const { store } = renderItemTreeView([parentNode], null, [parentNode.id]);

      // 初期状態では展開されていることを確認
      expect(getExpandedItemIds(store)).toContain(parentNode.id);
      expect(screen.getByText('child-item')).toBeInTheDocument();

      // 親アイテムのツリーアイテムを取得（展開状態では子アイテムも含まれる）
      const parentTreeItem = screen.getByRole('treeitem', { name: /parent-item/ });

      // 折りたたみアイコン（アイコンコンテナ）をクリック
      const iconContainer = parentTreeItem.querySelector('.MuiTreeItem-iconContainer');
      expect(iconContainer).toBeInTheDocument();

      await user.click(iconContainer!);

      // 折りたたみ状態がストアに保存されることを確認
      expect(getExpandedItemIds(store)).not.toContain(parentNode.id);

      // 子アイテムが非表示になることを確認（アニメーション待ち）
      await waitFor(() => {
        expect(screen.queryByText('child-item')).not.toBeInTheDocument();
      });
    });

    it('maintains expanded state for multiple items through user clicks', async () => {
      const { parentNode: parent1 } = createParentChildNodes('parent-1', 'child-1');
      const { parentNode: parent2 } = createParentChildNodes('parent-2', 'child-2');
      const { store } = renderItemTreeView([parent1, parent2]);

      // 初期状態では何も展開されていないことを確認
      expect(getExpandedItemIds(store)).toEqual([]);

      // 最初の親アイテムを展開
      const parent1TreeItem = screen.getByRole('treeitem', { name: 'parent-1' });
      const iconContainer1 = parent1TreeItem.querySelector('.MuiTreeItem-iconContainer');
      await user.click(iconContainer1!);

      // 最初の親が展開されることを確認
      expect(getExpandedItemIds(store)).toContain(parent1.id);
      expect(screen.getByText('child-1')).toBeInTheDocument();

      // 2番目の親アイテムを展開
      const parent2TreeItem = screen.getByRole('treeitem', { name: 'parent-2' });
      const iconContainer2 = parent2TreeItem.querySelector('.MuiTreeItem-iconContainer');
      await user.click(iconContainer2!);

      // 両方の親が展開されることを確認
      const expandedIds = getExpandedItemIds(store);
      expect(expandedIds).toContain(parent1.id);
      expect(expandedIds).toContain(parent2.id);
      expect(screen.getByText('child-1')).toBeInTheDocument();
      expect(screen.getByText('child-2')).toBeInTheDocument();
    });
  });
});
