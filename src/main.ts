import { BrowserWindow, app, dialog, ipcMain, safeStorage } from "electron";
import * as fs from "fs";
import path from "path";

const CREDENTIALS_PATH = "credentials.bin";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
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

  mainWindow.on("closed", () => app.quit());
};

app.whenReady().then(() => {
  createWindow();
});

app.once("window-all-closed", () => app.quit());

ipcMain.handle("read-nodes", async () => {
  if (!safeStorage.isEncryptionAvailable()) {
    dialog.showMessageBox({
      type: "warning",
      message: "機密情報の復号処理で問題が発生しました。",
    });
  }
  const encrypted = fs.readFileSync(CREDENTIALS_PATH);
  return JSON.parse(safeStorage.decryptString(encrypted));
});

ipcMain.handle("save-nodes", async (event, data) => {
  const dialogResponses = Object.freeze({
    NO: {
      text: "No",
      id: 0,
    },
    YES: {
      text: "Yes",
      id: 1,
    },
  });

  try {
    const result = await dialog.showMessageBox({
      type: "question",
      message: "現在の内容で保存してもよろしいですか？",
      buttons: Object.values(dialogResponses).map((response) => response.text),
      defaultId: dialogResponses.YES.id,
      cancelId: dialogResponses.NO.id,
    });

    if (result.response === dialogResponses.YES.id) {
      const encrypted = safeStorage.encryptString(JSON.stringify(data));
      fs.writeFileSync(CREDENTIALS_PATH, new Uint8Array(encrypted));
      return true;
    }
  } catch (err) {
    console.error(err);
  } finally {
    return false;
  }
});
