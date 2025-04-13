import { BrowserWindow, app } from "electron";
import path from "path";
import { ICON_PATH } from "../shared/constants";

class MainWindow extends BrowserWindow {
  constructor() {
    super({
      width: 1100,
      height: 600,
      title: "Password Manager",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.resolve(__dirname, "preload.js"),
      },
      icon: ICON_PATH,
    });

    this.loadFile("dist/index.html");

    this.on("closed", () => app.quit());
  }
}

export default MainWindow;
