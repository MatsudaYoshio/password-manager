/**
 * autoBackup.tsの自動バックアップ機能のテスト
 *
 * 起動時の自動バックアップ動作を検証する
 */

// モック関数の定義（jest.mockより前に定義）
const mockGetBackupSettings = jest.fn();
const mockIpcMainOnce = jest.fn();
const mockWebContentsSend = jest.fn();

// モジュールをモック化
jest.mock('../utils/backupSettings', () => ({
  getBackupSettings: () => mockGetBackupSettings()
}));

jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
  ipcMain: {
    once: (...args: unknown[]) => mockIpcMainOnce(...args)
  }
}));

import { BrowserWindow } from 'electron';

// モック適用後にautoBackupをインポート
import { setupAutoBackup } from '../autoBackup';

describe('setupAutoBackup', () => {
  let mockMainWindow: BrowserWindow;

  beforeEach(() => {
    // モックをクリア
    jest.clearAllMocks();

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

  describe('multiple initialization', () => {
    it('should_allow_multiple_calls_without_side_effects', () => {
      // Given: 自動バックアップが有効
      mockGetBackupSettings.mockReturnValue({
        backupEnabled: true,
        backupPath: '/test/backup/path'
      });

      // When: setupAutoBackupを複数回実行
      setupAutoBackup(mockMainWindow);
      setupAutoBackup(mockMainWindow);

      // Then: 各呼び出しでリスナーが登録される
      expect(mockIpcMainOnce).toHaveBeenCalledTimes(2);
    });
  });
});
