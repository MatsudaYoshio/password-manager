import { app, BrowserWindow, Tray, Menu } from "electron";
import { ICON_PATH } from "../shared/constants";

class PasswordManagerTray extends Tray {
  static readonly MENU_CONFIG = Menu.buildFromTemplate([
    {
      label: "Exit",
      click: () => app.quit(),
    },
  ]);

  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    super(ICON_PATH);
    this.mainWindow = mainWindow;

    this.setToolTip("Password Manager");

    this.on("click", this.onClick);
    this.on("right-click", this.onRightClick.bind(this));
  }

  onClick = () => (this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show());
  onRightClick = () => this.popUpContextMenu(PasswordManagerTray.MENU_CONFIG);
}

export default PasswordManagerTray;
