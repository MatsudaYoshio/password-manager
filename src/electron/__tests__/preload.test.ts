/**
 * preload.tsのイベントリスナー機能のテスト
 *
 * 実際のpreload.tsからエクスポートされたapiオブジェクトをテストする
 */

// electronモジュールをモック化（requireより前に実行される必要がある）
const mockExposeInMainWorld = jest.fn();
const mockOn = jest.fn();
const mockRemoveListener = jest.fn();
const mockInvoke = jest.fn().mockResolvedValue(undefined);

jest.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: mockExposeInMainWorld
  },
  ipcRenderer: {
    on: mockOn,
    removeListener: mockRemoveListener,
    invoke: mockInvoke
  }
}));

// モックが適用された後に動的にpreload.tsをインポート
// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const preloadModule = require('../preload');

describe('preload event listeners', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    mockOn.mockClear();
    mockRemoveListener.mockClear();
    mockInvoke.mockClear();
  });

  describe('onSaveData', () => {
    it('should_register_listener_and_return_handler_reference', () => {
      // Given: コールバック関数
      const callback = jest.fn();

      // When: 実際のapi.onSaveDataを呼ぶ
      const handler = preloadModule.api.onSaveData(callback);

      // Then: ipcRenderer.onが正しく呼ばれる
      expect(mockOn).toHaveBeenCalledWith('save-data', handler);
      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    it('should_invoke_callback_when_handler_is_called', () => {
      // Given: コールバック関数
      const callback = jest.fn();

      // When: ハンドラーを取得して実行
      const handler = preloadModule.api.onSaveData(callback);
      handler();

      // Then: コールバックが実行される
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('offSaveData', () => {
    it('should_remove_listener_with_correct_handler_reference', () => {
      // Given: 登録されたハンドラー
      const callback = jest.fn();
      const handler = preloadModule.api.onSaveData(callback);

      // When: offSaveDataを実行
      preloadModule.api.offSaveData(handler);

      // Then: 正しいハンドラー参照でremoveListenerが呼ばれる
      expect(mockRemoveListener).toHaveBeenCalledWith('save-data', handler);
    });

    it('should_prevent_memory_leak_by_removing_correct_handler', () => {
      // Given: 複数のハンドラーを登録
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const handler1 = preloadModule.api.onSaveData(callback1);
      const handler2 = preloadModule.api.onSaveData(callback2);

      // When: 特定のハンドラーのみ削除
      preloadModule.api.offSaveData(handler1);

      // Then: 指定したハンドラーのみが削除される
      expect(mockRemoveListener).toHaveBeenCalledWith('save-data', handler1);
      expect(mockRemoveListener).not.toHaveBeenCalledWith('save-data', handler2);
    });
  });

  describe('event listener lifecycle', () => {
    it('should_support_multiple_register_and_cleanup_cycles', () => {
      // Given: コールバック関数
      const callback = jest.fn();

      // When: 登録→削除→再登録のサイクル
      const handler1 = preloadModule.api.onSaveData(callback);
      preloadModule.api.offSaveData(handler1);

      const handler2 = preloadModule.api.onSaveData(callback);

      // Then: 各操作が正しく実行される
      expect(mockOn).toHaveBeenCalledTimes(2);
      expect(mockRemoveListener).toHaveBeenCalledTimes(1);
      expect(handler1).not.toBe(handler2); // 異なるハンドラー参照
    });
  });

  describe('all event types', () => {
    const eventConfigs = [
      { event: 'save-data', onMethod: 'onSaveData', offMethod: 'offSaveData' },
      { event: 'add-top-item', onMethod: 'onAddTopItem', offMethod: 'offAddTopItem' },
      { event: 'add-sub-item', onMethod: 'onAddSubItem', offMethod: 'offAddSubItem' },
      { event: 'remove-subtree', onMethod: 'onRemoveSubtree', offMethod: 'offRemoveSubtree' },
      { event: 'export-data', onMethod: 'onExportData', offMethod: 'offExportData' }
    ];

    eventConfigs.forEach(({ event, onMethod, offMethod }) => {
      it(`should_handle_${event}_event_correctly`, () => {
        // Given: コールバック関数
        const callback = jest.fn();

        // When: イベントリスナーを登録
        const handler = preloadModule.api[onMethod](callback);

        // Then: 正しいイベントタイプで登録される
        expect(mockOn).toHaveBeenCalledWith(event, handler);

        // When: ハンドラーを実行
        handler();

        // Then: コールバックが呼ばれる
        expect(callback).toHaveBeenCalledTimes(1);

        // When: クリーンアップ
        preloadModule.api[offMethod](handler);

        // Then: 正しいイベントタイプとハンドラーで削除される
        expect(mockRemoveListener).toHaveBeenCalledWith(event, handler);
      });
    });
  });

  describe('contextBridge integration', () => {
    it('should_expose_api_to_main_world', () => {
      // Then: contextBridge.exposeInMainWorldがモジュールロード時に呼ばれている
      expect(mockExposeInMainWorld).toHaveBeenCalledWith('api', expect.any(Object));

      // モジュールが正しくエクスポートされていることを確認
      expect(preloadModule.api).toBeDefined();
      expect(typeof preloadModule.api.onSaveData).toBe('function');
    });
  });
});
