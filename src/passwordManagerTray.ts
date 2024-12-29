import { app, BrowserWindow, Tray, Menu } from "electron";
import path from "path";

class passwordManagerTray extends Tray {
  static readonly ICON_PATH: string = path.join(app.getAppPath(), "src/assets", "tray_image.ico");
  static readonly MENU_CONFIG = Menu.buildFromTemplate([
    {
      label: "Exit",
      click: () => app.quit(),
    },
  ]);

  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    super(passwordManagerTray.ICON_PATH);
    this.mainWindow = mainWindow;

    this.setToolTip("Password Manager");

    this.on("click", this.onClick);
    this.on("right-click", this.onRightClick.bind(this));
  }

  onClick = () => (this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show());
  onRightClick = () => this.popUpContextMenu(passwordManagerTray.MENU_CONFIG);
}

export default passwordManagerTray;
