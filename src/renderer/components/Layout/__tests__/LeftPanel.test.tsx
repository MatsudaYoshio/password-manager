/**
 * LeftPanelコンポーネントのテスト
 *
 * パネルのリサイズ、サイズの保存/読み込み機能を検証する
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LeftPanel from '../LeftPanel';

interface PanelMockProps {
  children: React.ReactNode;
  onResize?: (size: { asPercentage: number }) => void;
  defaultSize?: string;
  minSize?: string;
  maxSize?: string;
  style?: React.CSSProperties;
}

// react-resizable-panelsのモック
jest.mock('react-resizable-panels', () => ({
  Panel: ({ children, onResize, defaultSize, minSize, maxSize, style }: PanelMockProps) => (
    <div
      data-testid='resizable-panel'
      data-default-size={defaultSize}
      data-min-size={minSize}
      data-max-size={maxSize}
      data-onresize={onResize ? 'defined' : 'undefined'}
      style={style}
    >
      {onResize && (
        <button data-testid='resize-trigger' onClick={() => onResize({ asPercentage: 25 })}>
          Resize
        </button>
      )}
      {children}
    </div>
  )
}));

describe('LeftPanel', () => {
  let mockGetLeftPanelSize: jest.Mock;
  let mockSaveLeftPanelSize: jest.Mock;

  // Unhandled promise rejectionのグローバルハンドラ
  const originalProcessListeners = process.listeners('unhandledRejection');

  beforeAll(() => {
    // テスト中のunhandled rejectionを抑制
    process.removeAllListeners('unhandledRejection');
  });

  afterAll(() => {
    // 元のリスナーを復元
    originalProcessListeners.forEach(listener => {
      process.on('unhandledRejection', listener);
    });
  });

  beforeEach(() => {
    // Given: window.apiのモックをリセット
    mockGetLeftPanelSize = jest.fn().mockResolvedValue(20);
    mockSaveLeftPanelSize = jest.fn().mockResolvedValue(undefined);

    window.api.getLeftPanelSize = mockGetLeftPanelSize;
    window.api.saveLeftPanelSize = mockSaveLeftPanelSize;

    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('does_not_render_panel_before_size_is_loaded', () => {
      // Given: サイズの取得が保留中
      mockGetLeftPanelSize.mockReturnValue(new Promise(() => {}));

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: パネルがレンダリングされない
      expect(screen.queryByTestId('resizable-panel')).not.toBeInTheDocument();
    });

    it('renders_panel_with_saved_size_when_available', async () => {
      // Given: 保存されたサイズが25%
      mockGetLeftPanelSize.mockResolvedValue(25);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: 保存されたサイズでパネルがレンダリングされる
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel).toBeInTheDocument();
        expect(panel.getAttribute('data-default-size')).toBe('25%');
      });
    });

    it('renders_panel_with_default_size_when_no_saved_size_exists', async () => {
      // Given: 保存されたサイズがない
      mockGetLeftPanelSize.mockResolvedValue(null);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: デフォルトサイズ（20%）でパネルがレンダリングされる
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel).toBeInTheDocument();
        expect(panel.getAttribute('data-default-size')).toBe('20%');
      });
    });

    it('renders_panel_with_default_size_when_saved_size_is_undefined', async () => {
      // Given: 保存されたサイズがundefined
      mockGetLeftPanelSize.mockResolvedValue(undefined);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: デフォルトサイズ（20%）でパネルがレンダリングされる
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel).toBeInTheDocument();
        expect(panel.getAttribute('data-default-size')).toBe('20%');
      });
    });
  });

  describe('panel constraints', () => {
    beforeEach(() => {
      mockGetLeftPanelSize.mockResolvedValue(20);
    });

    it('sets_minimum_size_to_10_percent', async () => {
      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: 最小サイズが10%に設定される
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel.getAttribute('data-min-size')).toBe('10%');
      });
    });

    it('sets_maximum_size_to_30_percent', async () => {
      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: 最大サイズが30%に設定される
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel.getAttribute('data-max-size')).toBe('30%');
      });
    });
  });

  describe('panel styling', () => {
    beforeEach(() => {
      mockGetLeftPanelSize.mockResolvedValue(20);
    });

    it('applies_correct_overflow_styles', async () => {
      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: オーバーフロースタイルが正しく設定される
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        const style = panel.style;
        expect(style.overflowY).toBe('auto');
        expect(style.overflowX).toBe('hidden');
      });
    });
  });

  describe('content rendering', () => {
    beforeEach(() => {
      mockGetLeftPanelSize.mockResolvedValue(20);
    });

    it('renders_children_content_after_initialization', async () => {
      // When: 子要素を含むコンポーネントをレンダリング
      render(
        <LeftPanel>
          <div data-testid='child-content'>Test Content</div>
        </LeftPanel>
      );

      // Then: 子要素がレンダリングされる
      await waitFor(() => {
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });

    it('renders_multiple_children', async () => {
      // When: 複数の子要素を含むコンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </LeftPanel>
      );

      // Then: すべての子要素がレンダリングされる
      await waitFor(() => {
        expect(screen.getByText('First Child')).toBeInTheDocument();
        expect(screen.getByText('Second Child')).toBeInTheDocument();
        expect(screen.getByText('Third Child')).toBeInTheDocument();
      });
    });
  });

  describe('resize handling', () => {
    beforeEach(() => {
      mockGetLeftPanelSize.mockResolvedValue(20);
      mockSaveLeftPanelSize.mockResolvedValue(undefined);
    });

    it('provides_onResize_handler_to_panel', async () => {
      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: onResizeハンドラーが設定される
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel.getAttribute('data-onresize')).toBe('defined');
      });
    });

    it('debounces_save_operation_on_resize', async () => {
      // Given: コンポーネントがレンダリングされている
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      await waitFor(() => screen.getByTestId('resizable-panel'));

      // When: 短時間に複数回リサイズイベントが発生
      const resizeTrigger = screen.getByTestId('resize-trigger');
      fireEvent.click(resizeTrigger);
      fireEvent.click(resizeTrigger);

      // 500ms未満の間隔では保存されない
      jest.advanceTimersByTime(100);
      expect(mockSaveLeftPanelSize).not.toHaveBeenCalled();

      // When: デバウンス時間が経過
      jest.advanceTimersByTime(400);

      // Then: デバウンス完了後に保存が1回実行される
      expect(mockSaveLeftPanelSize).toHaveBeenCalledTimes(1);
      expect(mockSaveLeftPanelSize).toHaveBeenCalledWith(25);
    });
  });

  describe('cleanup on unmount', () => {
    beforeEach(() => {
      mockGetLeftPanelSize.mockResolvedValue(20);
    });

    it('clears_pending_timeout_on_unmount', async () => {
      // Given: コンポーネントがレンダリングされている
      const { unmount } = render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      await waitFor(() => screen.getByTestId('resizable-panel'));

      // When: リサイズイベントが発生
      const resizeTrigger = screen.getByTestId('resize-trigger');
      fireEvent.click(resizeTrigger);

      // When: コンポーネントがアンマウントされる
      unmount();

      // Then: タイムアウトがクリアされる（アンマウント後に保存処理が実行されない）
      jest.advanceTimersByTime(1000);
      expect(mockSaveLeftPanelSize).not.toHaveBeenCalled();
    });
  });

  describe('API interaction', () => {
    it('calls_getLeftPanelSize_on_mount', async () => {
      // Given: APIモックが設定されている
      mockGetLeftPanelSize.mockResolvedValue(20);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: getLeftPanelSizeが呼ばれる
      await waitFor(() => {
        expect(mockGetLeftPanelSize).toHaveBeenCalledTimes(1);
      });
    });

    it('handles_null_return_value_as_default', async () => {
      // Given: APIがnullを返す
      mockGetLeftPanelSize.mockResolvedValue(null);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: デフォルトサイズが使用される
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel.getAttribute('data-default-size')).toBe('20%');
      });
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      // すべてのエッジケーステストでデフォルトの成功応答を設定
      mockGetLeftPanelSize.mockResolvedValue(20);
    });

    it('handles_zero_size_value', async () => {
      // Given: 保存されたサイズが0
      mockGetLeftPanelSize.mockResolvedValue(0);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: 0%でパネルがレンダリングされる
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel.getAttribute('data-default-size')).toBe('0%');
      });
    });

    it('handles_boundary_size_values', async () => {
      // Given: 保存されたサイズが境界値（10%）
      mockGetLeftPanelSize.mockResolvedValue(10);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: 10%でパネルがレンダリングされる
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel.getAttribute('data-default-size')).toBe('10%');
      });
    });

    it('handles_maximum_boundary_size', async () => {
      // Given: 保存されたサイズが境界値（30%）
      mockGetLeftPanelSize.mockResolvedValue(30);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: 30%でパネルがレンダリングされる
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel.getAttribute('data-default-size')).toBe('30%');
      });
    });
  });

  describe('size persistence integration', () => {
    it('reads_size_from_storage_and_applies_it', async () => {
      // Given: ストレージに22%が保存されている
      mockGetLeftPanelSize.mockResolvedValue(22);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: 保存された値が読み込まれ、適用される
      await waitFor(() => {
        expect(mockGetLeftPanelSize).toHaveBeenCalledTimes(1);
        const panel = screen.getByTestId('resizable-panel');
        expect(panel.getAttribute('data-default-size')).toBe('22%');
      });
    });

    it('falls_back_to_default_when_storage_returns_null', async () => {
      // Given: ストレージが空
      mockGetLeftPanelSize.mockResolvedValue(null);

      // When: コンポーネントをレンダリング
      render(
        <LeftPanel>
          <div>Test Content</div>
        </LeftPanel>
      );

      // Then: デフォルト値が使用される
      await waitFor(() => {
        const panel = screen.getByTestId('resizable-panel');
        expect(panel.getAttribute('data-default-size')).toBe('20%');
      });
    });
  });
});
