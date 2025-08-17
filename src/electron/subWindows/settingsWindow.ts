import { BrowserWindow } from 'electron';
import path from 'path';
import { ICON_PATH } from '../../shared/constants';
import { isDevelopment } from '../utils/environment';

class SettingsWindow extends BrowserWindow {
  constructor(parentWindow: BrowserWindow) {
    super({
      width: 800,
      height: 600,
      title: '設定',
      parent: parentWindow,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.resolve(__dirname, 'preload.js')
      },
      icon: ICON_PATH
    });

    this.loadFile(path.resolve(__dirname, 'settings.html'));

    this.setMenuBarVisibility(isDevelopment());

    this.on('closed', () => {
      this.destroy();
    });
  }

  public focusOrCreate(parentWindow: BrowserWindow) {
    this.isDestroyed() ? new SettingsWindow(parentWindow) : this.focus();
  }
}

export default SettingsWindow;
