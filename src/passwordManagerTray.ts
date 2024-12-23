import { app, BrowserWindow, Tray } from "electron";
import path from "path";

class passwordManagerTray extends Tray {
  static readonly ICON_PATH: string = path.join(app.getAppPath(), "src/assets", "tray_image.ico");

  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    super(passwordManagerTray.ICON_PATH);
    this.mainWindow = mainWindow;

    this.setToolTip("Password Manager");

    this.on("click", this.onClick);
  }

  onClick = () => (this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show());
}

export default passwordManagerTray;
