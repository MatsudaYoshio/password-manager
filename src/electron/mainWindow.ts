import { BrowserWindow, app } from 'electron';
import path from 'path';
import { ICON_PATH } from '../shared/constants';
import store from './store';

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

    this.loadFile(path.join(__dirname, 'index.html'));

    this.on('closed', () => app.quit());

    if (store.get('backupEnabled')) {
      this.webContents.once('did-finish-load', () => {
        this.webContents.send('export-data');
      });
    }
  }
}

export default MainWindow;
