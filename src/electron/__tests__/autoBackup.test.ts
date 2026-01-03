/**
 * autoBackup.tsの自動バックアップ機能のテスト
 *
 * 起動時の自動バックアップ動作を検証する
 */

// モック関数の定義（jest.mockより前に定義）
const mockGetBackupSettings = jest.fn();
const mockIpcMainOnce = jest.fn();
const mockIpcMainRemoveAllListeners = jest.fn();
const mockWebContentsSend = jest.fn();

// モジュールをモック化
jest.mock('../utils/backupSettings', () => ({
  getBackupSettings: () => mockGetBackupSettings()
}));

jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
  ipcMain: {
    once: (...args: unknown[]) => mockIpcMainOnce(...args),
    removeAllListeners: (...args: unknown[]) => mockIpcMainRemoveAllListeners(...args)
  }
}));

import { BrowserWindow } from 'electron';

describe('setupAutoBackup', () => {
  let mockMainWindow: BrowserWindow;
  let setupAutoBackup: (mainWindow: BrowserWindow) => void;

  beforeEach(async () => {
    // モジュールレベルの状態をリセット
    jest.resetModules();

    // モックをクリア
    jest.clearAllMocks();

    // モジュールを再インポート
    const autoBackupModule = await import('../autoBackup');
    setupAutoBackup = autoBackupModule.setupAutoBackup;

    // BrowserWindowのモックを作成
    mockMainWindow = {
      webContents: {
        send: mockWebContentsSend
      }
    } as unknown as BrowserWindow;
  });

  describe('when backup is enabled', () => {
    beforeEach(() => {
      // Given: 自動バックアップが有効
      mockGetBackupSettings.mockReturnValue({
        backupEnabled: true,
        backupPath: '/test/backup/path'
      });
    });

    it('should_register_renderer_ready_listener', () => {
      // When: setupAutoBackupを実行
      setupAutoBackup(mockMainWindow);

      // Then: renderer-readyイベントリスナーが登録される
      expect(mockIpcMainOnce).toHaveBeenCalledWith('renderer-ready', expect.any(Function));
    });

    it('should_trigger_export_data_when_renderer_is_ready', () => {
      // Given: setupAutoBackupを実行
      setupAutoBackup(mockMainWindow);

      // When: renderer-readyイベントが発火
      const registeredCallback = mockIpcMainOnce.mock.calls[0][1];
      registeredCallback();

      // Then: export-dataイベントが送信される
      expect(mockWebContentsSend).toHaveBeenCalledWith('export-data');
      expect(mockWebContentsSend).toHaveBeenCalledTimes(1);
    });

    it('should_use_once_listener_to_prevent_multiple_backups', () => {
      // When: setupAutoBackupを実行
      setupAutoBackup(mockMainWindow);

      // Then: onceメソッドが使用されている（onではない）
      expect(mockIpcMainOnce).toHaveBeenCalled();
      expect(mockIpcMainOnce).toHaveBeenCalledWith('renderer-ready', expect.any(Function));
    });
  });

  describe('when backup is disabled', () => {
    beforeEach(() => {
      // Given: 自動バックアップが無効
      mockGetBackupSettings.mockReturnValue({
        backupEnabled: false,
        backupPath: '/test/backup/path'
      });
    });

    it('should_not_register_any_listener', () => {
      // When: setupAutoBackupを実行
      setupAutoBackup(mockMainWindow);

      // Then: イベントリスナーが登録されない
      expect(mockIpcMainOnce).not.toHaveBeenCalled();
    });

    it('should_not_trigger_export_data', () => {
      // When: setupAutoBackupを実行
      setupAutoBackup(mockMainWindow);

      // Then: export-dataイベントが送信されない
      expect(mockWebContentsSend).not.toHaveBeenCalled();
    });
  });

  describe('backup settings integration', () => {
    it('should_read_backup_settings_on_initialization', () => {
      // Given: 自動バックアップが有効
      mockGetBackupSettings.mockReturnValue({
        backupEnabled: true,
        backupPath: '/test/backup/path'
      });

      // When: setupAutoBackupを実行
      setupAutoBackup(mockMainWindow);

      // Then: getBackupSettingsが呼ばれる
      expect(mockGetBackupSettings).toHaveBeenCalledTimes(1);
    });

    it('should_handle_missing_backup_path_gracefully', () => {
      // Given: backupPathが未設定
      mockGetBackupSettings.mockReturnValue({
        backupEnabled: true,
        backupPath: undefined
      });

      // When: setupAutoBackupを実行
      setupAutoBackup(mockMainWindow);

      // Then: エラーなく実行され、リスナーが登録される
      expect(mockIpcMainOnce).toHaveBeenCalled();
    });
  });

  describe('idempotency', () => {
    beforeEach(() => {
      // Given: 自動バックアップが有効
      mockGetBackupSettings.mockReturnValue({
        backupEnabled: true,
        backupPath: '/test/backup/path'
      });
    });

    it('should_remove_existing_listeners_before_registering', () => {
      // When: setupAutoBackupを実行
      setupAutoBackup(mockMainWindow);

      // Then: 既存のリスナーが削除される
      expect(mockIpcMainRemoveAllListeners).toHaveBeenCalledWith('renderer-ready');
    });

    it('should_be_idempotent_by_removing_listeners_on_each_call', () => {
      // When: setupAutoBackupを複数回実行
      setupAutoBackup(mockMainWindow);
      setupAutoBackup(mockMainWindow);
      setupAutoBackup(mockMainWindow);

      // Then: 各呼び出しでリスナーが削除され、再登録される
      expect(mockIpcMainRemoveAllListeners).toHaveBeenCalledTimes(3);
      expect(mockIpcMainOnce).toHaveBeenCalledTimes(3);
    });

    it('should_prevent_multiple_auto_backups_by_using_once', () => {
      // Given: setupAutoBackupを複数回実行
      setupAutoBackup(mockMainWindow);
      setupAutoBackup(mockMainWindow);

      // When: 最後に登録されたコールバックを実行
      const lastCallIndex = mockIpcMainOnce.mock.calls.length - 1;
      const registeredCallback = mockIpcMainOnce.mock.calls[lastCallIndex][1];
      registeredCallback();

      // Then: export-dataイベントが送信される
      expect(mockWebContentsSend).toHaveBeenCalledWith('export-data');
    });
  });
});
