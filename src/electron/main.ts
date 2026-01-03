import { app } from 'electron';
import { setTimeout } from 'timers';
import setupIpcHandlers from './ipcHandlers';
import MainMenu from './mainMenu';
import MainWindow from './mainWindow';
import PasswordManagerTray from './passwordManagerTray';
import { AutoUpdater } from './autoUpdater';

const createWindow = () => {
  const mainWindow = new MainWindow();
  new PasswordManagerTray(mainWindow);
  new MainMenu(mainWindow);

  // 自動更新の初期化と起動時チェック
  const updater = new AutoUpdater(mainWindow);

  // 起動後3秒待ってからチェック
  setTimeout(() => {
    updater.checkForUpdates();
  }, 3000);
};

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
});

app.once('window-all-closed', () => app.quit());
