import path from "path";
import { BrowserWindow, app } from "electron";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: path.resolve(__dirname, "preload.js"),
    },
  });

  const options = {
    silent: true,
    deviceName: "My-Printer",
    pageRanges: [
      {
        from: 0,
        to: 1,
      },
    ],
    margins: { top: 0 },
  };
  mainWindow.webContents.print(options, (success, errorType) => {
    if (!success) console.log(errorType);
  });

  mainWindow.loadFile("dist/index.html");
  // mainWindow.webContents.openDevTools({ mode: "detach" });
};

app.whenReady().then(() => {
  createWindow();
});

app.once("window-all-closed", () => app.quit());
