import { BrowserWindow } from 'electron';
import path from 'path';
import { ICON_PATH } from '../../shared/constants';

class SettingsWindow extends BrowserWindow {
  private static instance: SettingsWindow | null = null;

  private constructor(parentWindow: BrowserWindow) {
    super({
      width: 800,
      height: 600,
      title: '設定',
      parent: parentWindow,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.resolve(__dirname, 'preload.js')
      },
      icon: ICON_PATH
    });

    this.setMenu(null);
    this.loadFile(path.resolve(__dirname, 'settings.html'));

    this.on('closed', () => {
      SettingsWindow.instance = null;
    });
  }

  /**
   * Gets or creates the settings window singleton.
   * If an instance exists and is not destroyed, focuses it; otherwise creates a new instance.
   * @param parentWindow - The parent browser window
   */
  public static focusOrCreate(parentWindow: BrowserWindow): void {
    if (this.instance === null || this.instance.isDestroyed()) {
      this.instance = new SettingsWindow(parentWindow);
    } else {
      this.instance.focus();
    }
  }
}

export default SettingsWindow;
