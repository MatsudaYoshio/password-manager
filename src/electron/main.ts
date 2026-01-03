import { app } from 'electron';
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
  const delay = 3000;
  const startTime = Date.now();

  const checkAfterDelay = () => {
    if (Date.now() - startTime >= delay) {
      updater.checkForUpdates();
    } else {
      process.nextTick(checkAfterDelay);
    }
  };

  process.nextTick(checkAfterDelay);
};

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
});

app.once('window-all-closed', () => app.quit());
