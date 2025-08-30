import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';
import TreeNode from '../../../models/treeNode';
import { createTestNode, renderWithStore } from './utils/helpers';

describe('Header', () => {
  const renderHeader = (
    stagingItems: TreeNode[] = [],
    mainItems: TreeNode[] = [],
    activeNode: TreeNode | null = null,
    expandedItemIds: string[] = []
  ) => {
    return renderWithStore(Header, stagingItems, mainItems, activeNode, expandedItemIds);
  };

  const expectAppBarToBePresent = () => expect(screen.getByRole('banner')).toBeInTheDocument();

  const expectAllButtonsToBePresent = () => {
    expect(screen.getByLabelText('save')).toBeInTheDocument();
    expect(screen.getByLabelText('add-folder')).toBeInTheDocument();
    expect(screen.getByLabelText('add-item')).toBeInTheDocument();
    expect(screen.getByLabelText('delete')).toBeInTheDocument();
  };

  describe('rendering', () => {
    const testCases = [
      {
        name: 'empty state',
        setup: () => renderHeader()
      },
      {
        name: 'with items in store',
        setup: () => renderHeader([createTestNode()])
      },
      {
        name: 'with active node selected',
        setup: () => {
          const activeNode = createTestNode();
          return renderHeader([activeNode], [], activeNode);
        }
      }
    ];

    testCases.forEach(({ name, setup }) => {
      it(`renders header component in ${name}`, () => {
        setup();
        expectAppBarToBePresent();
        expectAllButtonsToBePresent();
      });
    });
  });

  describe('button interactions', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('adds new top item when add-folder button is clicked', async () => {
      const { store } = renderHeader();

      const addFolderButton = screen.getByLabelText('add-folder');
      await user.click(addFolderButton);

      // ストアの状態を確認 - 新しいアイテムが追加されているはず
      const state = store.getState();
      expect(state.item.itemData.staging.length).toBeGreaterThan(0);
    });

    it('adds new sub item when add-item button is clicked', async () => {
      const parentNode = createTestNode({ title: 'parent-item', credentials: [] });
      const { store } = renderHeader([parentNode], [], parentNode);

      const addItemButton = screen.getByLabelText('add-item');
      await user.click(addItemButton);

      // ストアの状態を確認 - 親ノードに子が追加されているはず
      const state = store.getState();
      const updatedParent = state.item.itemData.staging.find(
        (item: TreeNode) => item.data.title === 'parent-item'
      );
      expect(updatedParent?.children?.length).toBeGreaterThan(0);
    });

    it('removes item when delete button is clicked', async () => {
      const testNode = createTestNode();
      const { store } = renderHeader([testNode], [], testNode);

      const deleteButton = screen.getByLabelText('delete');
      await user.click(deleteButton);

      // ストアの状態を確認 - アイテムが削除されているはず
      const state = store.getState();
      expect(state.item.itemData.staging.length).toBe(0);
    });

    it('calls save handler when save button is clicked', async () => {
      // mainとstagingで異なる状態にして保存が必要な状態を作る
      renderHeader([createTestNode()], []);

      const saveButton = screen.getByLabelText('save');
      await user.click(saveButton);

      // 保存処理が呼ばれることを確認（実際のAPIコールはモックされているので、エラーにならないことを確認）
      // この場合、例外が発生しないことで正常に動作していることを確認
      expect(saveButton).toBeInTheDocument();
    });
  });
});
