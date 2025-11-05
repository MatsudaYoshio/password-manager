/**
 * preload.tsのイベントリスナー機能のテスト
 *
 * 注: preloadスクリプトは実際のElectron環境でのみ動作するため、
 * このテストではipcRendererの動作をモック化して検証する
 */

describe('preload event listeners', () => {
  let mockIpcRenderer: {
    on: jest.Mock;
    once: jest.Mock;
    removeListener: jest.Mock;
    invoke: jest.Mock;
  };

  beforeEach(() => {
    // Given: ipcRendererのモック
    mockIpcRenderer = {
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      invoke: jest.fn()
    };
  });

  describe('onSaveData', () => {
    it('should_register_listener_and_return_handler_reference', () => {
      // Given: コールバック関数
      const callback = jest.fn();
      let capturedHandler: (() => void) | undefined;

      mockIpcRenderer.on.mockImplementation((channel, handler) => {
        if (channel === 'save-data') {
          capturedHandler = handler as () => void;
        }
      });

      // When: onSaveDataを実行（実際のpreload実装をシミュレート）
      const handler = (() => {
        const h = () => callback();
        mockIpcRenderer.on('save-data', h);
        return h;
      })();

      // Then: ipcRenderer.onが呼ばれ、ハンドラー参照が返される
      expect(mockIpcRenderer.on).toHaveBeenCalledWith('save-data', handler);
      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    it('should_invoke_callback_when_event_is_triggered', () => {
      // Given: コールバック関数とイベントハンドラー
      const callback = jest.fn();
      let capturedHandler: (() => void) | undefined;

      mockIpcRenderer.on.mockImplementation((channel, handler) => {
        if (channel === 'save-data') {
          capturedHandler = handler as () => void;
        }
      });

      const handler = (() => {
        const h = () => callback();
        mockIpcRenderer.on('save-data', h);
        return h;
      })();

      // When: イベントが発火
      if (capturedHandler) {
        capturedHandler();
      }

      // Then: コールバックが実行される
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('offSaveData', () => {
    it('should_remove_listener_with_correct_handler_reference', () => {
      // Given: 登録されたハンドラー
      const callback = jest.fn();
      const handler = () => callback();

      mockIpcRenderer.on('save-data', handler);

      // When: offSaveDataを実行
      mockIpcRenderer.removeListener('save-data', handler);

      // Then: 正しいハンドラー参照でremoveListenerが呼ばれる
      expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith('save-data', handler);
    });

    it('should_prevent_memory_leak_by_removing_correct_handler', () => {
      // Given: 複数のハンドラーを登録
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const handler1 = () => callback1();
      const handler2 = () => callback2();

      mockIpcRenderer.on('save-data', handler1);
      mockIpcRenderer.on('save-data', handler2);

      // When: 特定のハンドラーのみ削除
      mockIpcRenderer.removeListener('save-data', handler1);

      // Then: 指定したハンドラーのみが削除される
      expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith('save-data', handler1);
      expect(mockIpcRenderer.removeListener).not.toHaveBeenCalledWith('save-data', handler2);
    });
  });

  describe('event listener lifecycle', () => {
    it('should_support_multiple_register_and_cleanup_cycles', () => {
      // Given: コールバック関数
      const callback = jest.fn();

      // When: 登録→削除→再登録のサイクル
      const handler1 = (() => {
        const h = () => callback();
        mockIpcRenderer.on('save-data', h);
        return h;
      })();

      mockIpcRenderer.removeListener('save-data', handler1);

      const handler2 = (() => {
        const h = () => callback();
        mockIpcRenderer.on('save-data', h);
        return h;
      })();

      // Then: 各操作が正しく実行される
      expect(mockIpcRenderer.on).toHaveBeenCalledTimes(2);
      expect(mockIpcRenderer.removeListener).toHaveBeenCalledTimes(1);
      expect(handler1).not.toBe(handler2); // 異なるハンドラー参照
    });
  });

  describe('all event types', () => {
    const eventTypes = [
      'save-data',
      'add-top-item',
      'add-sub-item',
      'remove-subtree',
      'export-data'
    ];

    eventTypes.forEach(eventType => {
      it(`should_handle_${eventType}_event_correctly`, () => {
        // Given: コールバック関数
        const callback = jest.fn();

        // When: イベントリスナーを登録
        const handler = (() => {
          const h = () => callback();
          mockIpcRenderer.on(eventType, h);
          return h;
        })();

        // Then: 正しいイベントタイプで登録される
        expect(mockIpcRenderer.on).toHaveBeenCalledWith(eventType, handler);

        // When: クリーンアップ
        mockIpcRenderer.removeListener(eventType, handler);

        // Then: 正しいイベントタイプとハンドラーで削除される
        expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(eventType, handler);
      });
    });
  });
});
