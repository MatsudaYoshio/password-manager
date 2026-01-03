import { BrowserWindow, app } from 'electron';
import path from 'path';
import { ICON_PATH } from '../shared/constants';
import { setupAutoBackup } from './autoBackup';

class MainWindow extends BrowserWindow {
  constructor() {
    super({
      width: 1100,
      height: 600,
      title: 'Password Manager',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.resolve(__dirname, 'preload.js')
      },
      icon: ICON_PATH
    });

    // 自動バックアップ機能を初期化
    setupAutoBackup(this);

    this.loadFile(path.join(__dirname, 'index.html'));

    this.on('closed', () => app.quit());
  }
}

export default MainWindow;
