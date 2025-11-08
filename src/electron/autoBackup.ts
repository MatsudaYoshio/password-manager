import { BrowserWindow, ipcMain } from 'electron';
import { getBackupSettings } from './utils/backupSettings';

/**
 * 自動バックアップ機能を初期化
 * Reactのレンダリング完了後に自動的にバックアップを実行する
 * 冪等性を保証し、複数回呼び出されても一度だけ実行される
 */
export const setupAutoBackup = (mainWindow: BrowserWindow) => {
  const { backupEnabled } = getBackupSettings();

  if (!backupEnabled) return;

  // 既存のリスナーを削除してから登録（冪等性を保証）
  ipcMain.removeAllListeners('renderer-ready');
  ipcMain.once('renderer-ready', () => mainWindow.webContents.send('export-data'));
};
