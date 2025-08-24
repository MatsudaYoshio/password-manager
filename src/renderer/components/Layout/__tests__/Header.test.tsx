import { render, screen } from '../../../../test/test-utils';
import Header from '../Header';

// item-sliceのモック（top-level awaitの問題を回避）
jest.mock('../../../store/item-slice', () => ({
  __esModule: true,
  default: {
    reducer: (state = {}, _action: unknown) => state,
    actions: {}
  },
  itemActions: {},
  createItemSlice: jest.fn(() => ({
    reducer: (state = {}, _action: unknown) => state,
    actions: {}
  }))
}));

// フックのモック
jest.mock('../../../hooks/useSaveItems', () => jest.fn(() => jest.fn()));
jest.mock('../../../hooks/useAddNewTopItem', () => jest.fn(() => jest.fn()));
jest.mock('../../../hooks/useAddNewSubItem', () => jest.fn(() => jest.fn()));
jest.mock('../../../hooks/useRemoveSubtree', () => jest.fn(() => jest.fn()));

describe('Header', () => {
  test('renders header component', () => {
    render(<Header />);

    // AppBarが存在することを確認
    const appBar = screen.getByRole('banner');
    expect(appBar).toBeInTheDocument();
  });

  test('renders specific action buttons', () => {
    render(<Header />);

    // 特定のボタンが存在することを確認（aria-labelで識別）
    expect(screen.getByLabelText('Save items')).toBeInTheDocument();
    expect(screen.getByLabelText('Add new top item')).toBeInTheDocument();
    expect(screen.getByLabelText('Add new sub item')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete item')).toBeInTheDocument();
  });
});
