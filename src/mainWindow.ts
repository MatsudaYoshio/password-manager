import { BrowserWindow, app } from "electron";
import path from "path";

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
      icon: path.join(app.getAppPath(), "src/assets", "key.ico"),
    });

    this.loadFile("dist/index.html");

    this.on("closed", () => app.quit());
  }
}

export default MainWindow;
