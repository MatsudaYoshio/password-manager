import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DetailView from '../DetailView';
import TreeNode from '../../../models/treeNode';
import Credential from '../../../models/credential';
import { uuidv7 } from 'uuidv7';
import {
  createTestNode,
  renderWithStore,
  createStoreWithItems,
  getActiveNode
} from './utils/helpers';

describe('DetailView', () => {
  // ストアの状態からstagingアイテムを取得するヘルパー関数
  const getStagingItems = (store: ReturnType<typeof createStoreWithItems>) => {
    return store.getState().item.itemData.staging;
  };

  const renderDetailView = (
    stagingItems: TreeNode[] = [],
    activeNode: TreeNode | null = null,
    expandedItemIds: string[] = []
  ) => {
    return renderWithStore(DetailView, stagingItems, [], activeNode, expandedItemIds);
  };

  // テスト用のクレデンシャルを作成するヘルパー関数
  const createTestCredential = (overrides: Partial<Credential> = {}) => {
    return new Credential({
      name: uuidv7(),
      value: uuidv7(),
      showValue: false,
      ...overrides
    });
  };

  // 複数のテスト用クレデンシャルを作成するヘルパー関数
  const createTestCredentials = (count: number) =>
    Array.from({ length: count }, () => createTestCredential());

  describe('rendering', () => {
    it('renders empty detail view when no active node', () => {
      renderDetailView();

      // タイトルフィールドが空で表示されることを確認
      const titleField = screen.getByLabelText('Title');
      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue('');

      // 新しいクレデンシャル追加ボタンが表示されることを確認
      const addButton = screen.getByLabelText('add-credential');
      expect(addButton).toBeInTheDocument();
    });

    it('renders detail view with active node title', () => {
      const testNode = createTestNode({ title: 'Test Item', credentials: [] });
      renderDetailView([testNode], testNode);

      // タイトルフィールドにアクティブノードのタイトルが表示されることを確認
      const titleField = screen.getByLabelText('Title');
      expect(titleField).toHaveValue('Test Item');
    });

    it('renders detail view with credentials', () => {
      const credential = createTestCredential();
      const testNode = createTestNode({
        title: 'Test Item',
        credentials: [credential]
      });
      renderDetailView([testNode], testNode);

      // クレデンシャルのフィールドが表示されることを確認
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      // Valueフィールドは OutlinedInput なので、プレースホルダーテキストで確認
      expect(screen.getByText('Value')).toBeInTheDocument();

      // クレデンシャルの値が表示されることを確認
      expect(screen.getByDisplayValue(credential.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(credential.value)).toBeInTheDocument();
    });

    it('renders many credentials efficiently', () => {
      const credentials = createTestCredentials(5);
      const testNode = createTestNode({
        title: 'Test Item with Many Credentials',
        credentials
      });
      renderDetailView([testNode], testNode);

      // 5つのクレデンシャルがすべて表示されることを確認
      credentials.forEach(credential => {
        expect(screen.getByDisplayValue(`${credential.name}`)).toBeInTheDocument();
        expect(screen.getByDisplayValue(`${credential.value}`)).toBeInTheDocument();
      });

      // 削除ボタンも5つ表示されることを確認
      const removeButtons = screen.getAllByLabelText('remove-credential');
      expect(removeButtons).toHaveLength(5);
    });

    it('renders password field as hidden by default', () => {
      const credential = createTestCredential();
      const testNode = createTestNode({
        title: 'Test Item',
        credentials: [credential]
      });
      renderDetailView([testNode], testNode);

      // パスワードフィールドがhiddenタイプで表示されることを確認
      const passwordField = screen.getByDisplayValue(credential.value);
      expect(passwordField).toHaveAttribute('type', 'password');
    });
  });

  describe('title interactions', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('updates title when title field is changed', async () => {
      const testNode = createTestNode({ title: 'Original Title', credentials: [] });
      const { store } = renderDetailView([testNode], testNode);

      const titleField = screen.getByLabelText('Title');
      await user.clear(titleField);
      await user.type(titleField, 'Updated Title');

      // ストアの状態が更新されることを確認
      await waitFor(() => {
        const activeNode = getActiveNode(store);
        expect(activeNode?.data.title).toBe('Updated Title');
      });
    });

    it('updates staging items when title is changed', async () => {
      const testNode = createTestNode({ title: 'Original Title', credentials: [] });
      const { store } = renderDetailView([testNode], testNode);

      const titleField = screen.getByLabelText('Title');
      await user.clear(titleField);
      await user.type(titleField, 'Updated Title');

      // stagingアイテムも更新されることを確認
      await waitFor(() => {
        const stagingItems = getStagingItems(store);
        const updatedItem = stagingItems.find(item => item.id === testNode.id);
        expect(updatedItem?.data.title).toBe('Updated Title');
      });
    });
  });

  describe('credential interactions', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('updates credential name when name field is changed', async () => {
      const credential = createTestCredential();
      const testNode = createTestNode({
        title: 'Test Item',
        credentials: [credential]
      });
      const { store } = renderDetailView([testNode], testNode);

      const nameField = screen.getByDisplayValue(credential.name);
      await user.clear(nameField);
      await user.type(nameField, 'updated-username');

      // ストアの状態が更新されることを確認
      await waitFor(() => {
        const activeNode = getActiveNode(store);
        expect(activeNode?.data.credentials[0].name).toBe('updated-username');
      });
    });

    it('updates credential value when password field is changed', async () => {
      const credential = createTestCredential();
      const testNode = createTestNode({
        title: 'Test Item',
        credentials: [credential]
      });
      const { store } = renderDetailView([testNode], testNode);

      const passwordField = screen.getByDisplayValue(credential.value);
      await user.clear(passwordField);
      await user.type(passwordField, 'updated-password');

      // ストアの状態が更新されることを確認
      await waitFor(() => {
        const activeNode = getActiveNode(store);
        expect(activeNode?.data.credentials[0].value).toBe('updated-password');
      });
    });

    it('toggles password visibility when visibility button is clicked', async () => {
      const credential = createTestCredential();
      const testNode = createTestNode({
        title: 'Test Item',
        credentials: [credential]
      });
      const { store } = renderDetailView([testNode], testNode);

      const visibilityButton = screen.getByLabelText('toggle password visibility');
      const passwordField = screen.getByDisplayValue(credential.value);

      // 初期状態ではパスワードが隠されていることを確認
      expect(passwordField).toHaveAttribute('type', 'password');

      // 表示ボタンをクリック
      await user.click(visibilityButton);

      // パスワードが表示されることを確認
      await waitFor(() => {
        expect(passwordField).toHaveAttribute('type', 'text');
      });

      // ストアの状態も更新されることを確認
      await waitFor(() => {
        const activeNode = getActiveNode(store);
        expect(activeNode?.data.credentials[0].showValue).toBe(true);
      });
    });

    it('adds new credential when add button is clicked', async () => {
      const testNode = createTestNode({ title: 'Test Item', credentials: [] });
      const { store } = renderDetailView([testNode], testNode);

      const addButton = screen.getByLabelText('add-credential');
      await user.click(addButton);

      // 新しいクレデンシャルが追加されることを確認
      await waitFor(() => {
        const activeNode = getActiveNode(store);
        expect(activeNode?.data.credentials.length).toBe(1);
      });

      // 新しいフィールドが表示されることを確認
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
    });

    it('removes credential when remove button is clicked', async () => {
      const credential = createTestCredential();
      const testNode = createTestNode({
        title: 'Test Item',
        credentials: [credential]
      });
      const { store } = renderDetailView([testNode], testNode);

      const removeButton = screen.getByLabelText('remove-credential');
      await user.click(removeButton);

      // クレデンシャルが削除されることを確認
      await waitFor(() => {
        const activeNode = getActiveNode(store);
        expect(activeNode?.data.credentials.length).toBe(0);
      });

      // フィールドが非表示になることを確認
      await waitFor(() => {
        expect(screen.queryByDisplayValue(credential.name)).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue(credential.value)).not.toBeInTheDocument();
      });
    });
  });

  describe('clipboard interactions', () => {
    let user: ReturnType<typeof userEvent.setup>;
    let mockWriteText: jest.SpyInstance;

    beforeEach(() => {
      user = userEvent.setup();
      // navigator.clipboard.writeTextをモック
      mockWriteText = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    });

    afterEach(() => {
      mockWriteText.mockRestore();
    });

    it('copies credential name to clipboard when name copy button is clicked', async () => {
      const credential = createTestCredential({ name: 'copy-test-name' });
      const testNode = createTestNode({
        title: 'Test Item',
        credentials: [credential]
      });
      renderDetailView([testNode], testNode);

      // 名前フィールドの隣にあるコピーボタンをクリック
      const copyButtons = screen.getAllByRole('button');
      const nameCopyButton = copyButtons[0]; // 最初のコピーボタンは名前用

      await user.click(nameCopyButton);

      // クリップボードにコピーされることを確認
      expect(mockWriteText).toHaveBeenCalledWith('copy-test-name');
    });

    it('copies credential value to clipboard when value copy button is clicked', async () => {
      const credential = createTestCredential({ value: 'copy-test-value' });
      const testNode = createTestNode({
        title: 'Test Item',
        credentials: [credential]
      });
      renderDetailView([testNode], testNode);

      // 値フィールドの隣にあるコピーボタンをクリック
      const copyButtons = screen.getAllByRole('button');
      const valueCopyButton = copyButtons[1]; // 2番目のコピーボタンは値用

      await user.click(valueCopyButton);

      // クリップボードにコピーされることを確認
      expect(mockWriteText).toHaveBeenCalledWith('copy-test-value');
    });
  });

  describe('state synchronization', () => {
    it('renders correctly with different active nodes', () => {
      const node1 = createTestNode({ title: 'First Node', credentials: [] });

      // ノードでレンダリング
      renderDetailView([node1], node1);
      expect(screen.getByDisplayValue('First Node')).toBeInTheDocument();

      // コンポーネントが正しくレンダリングされることを確認
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
    });

    it('maintains credential state consistency', async () => {
      const credentials = [
        createTestCredential({ name: 'cred1', value: 'val1' }),
        createTestCredential({ name: 'cred2', value: 'val2' })
      ];
      const testNode = createTestNode({
        title: 'Test Item',
        credentials
      });
      const { store } = renderDetailView([testNode], testNode);

      const user = userEvent.setup();

      // 最初のクレデンシャルの名前を更新
      const firstNameField = screen.getByDisplayValue('cred1');
      await user.clear(firstNameField);
      await user.type(firstNameField, 'updated-cred1');

      // ストアの状態が正しく更新されることを確認
      await waitFor(() => {
        const activeNode = getActiveNode(store);
        expect(activeNode?.data.credentials[0].name).toBe('updated-cred1');
        expect(activeNode?.data.credentials[1].name).toBe('cred2'); // 他のクレデンシャルは変更されない
      });
    });
  });
});
