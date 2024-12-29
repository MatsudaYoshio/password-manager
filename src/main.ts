import { app, dialog, ipcMain, safeStorage } from "electron";
import * as fs from "fs";
import path from "path";
import MainWindow from "./mainWindow";
import passwordManagerTray from "./passwordManagerTray";

const CREDENTIALS_PATH = path.join(app.getAppPath(), "credentials.bin");

const createWindow = () => {
  const mainWindow = new MainWindow();

  new passwordManagerTray(mainWindow);
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
