import { app, dialog, ipcMain, safeStorage } from "electron";
import * as fs from "fs";
import path from "path";

const CREDENTIALS_PATH = path.join(app.getAppPath(), "credentials.bin");
const SAMPLE_CREDENTIALS_PATH = path.join(app.getAppPath(), "sample_credentials.json");

const setupIpcHandlers = () => {
  ipcMain.handle("read-nodes", handleReadNodes);
  ipcMain.handle("save-nodes", handleSaveNodes);
};

const readSampleData = () => JSON.parse(fs.readFileSync(SAMPLE_CREDENTIALS_PATH, "utf-8"));

const handleReadNodes = async () => {
  if (!safeStorage.isEncryptionAvailable()) {
    dialog.showMessageBox({
      type: "warning",
      message: "機密情報の復号処理で問題が発生しました。",
    });

    return readSampleData();
  }

  try {
    const encrypted = fs.readFileSync(CREDENTIALS_PATH);
    const decrypted = safeStorage.decryptString(encrypted);
    return JSON.parse(decrypted);
  } catch (err) {
    console.log("Failed to read credentials from file. Using sample data instead.: ", err);

    dialog.showMessageBox({
      type: "info",
      message: "パスワード情報が見つかりませんでしたので、代わりにサンプルデータを読み込みます。",
    });

    return readSampleData();
  }
};

const handleSaveNodes = async (event: Electron.IpcMainInvokeEvent, data: any) => {
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
  }
  return false;
};

export default setupIpcHandlers;
