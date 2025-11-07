import { BrowserWindow, ipcMain } from 'electron';
import { getBackupSettings } from './utils/backupSettings';

/**
 * 自動バックアップ機能を初期化
 * Reactのレンダリング完了後に自動的にバックアップを実行する
 */
export const setupAutoBackup = (mainWindow: BrowserWindow) => {
  const { backupEnabled } = getBackupSettings();

  if (!backupEnabled) return;

  // Reactのレンダリング完了を待つ
  ipcMain.once('renderer-ready', () => mainWindow.webContents.send('export-data'));
};
