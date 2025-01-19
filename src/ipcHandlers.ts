import { app, dialog, ipcMain, safeStorage } from "electron";
import * as fs from "fs";
import path from "path";

import QuestionDialog from "./questionDialog";
import TreeNode from "./web/models/treeNode";

const CREDENTIALS_PATH = path.join(app.getAppPath(), "credentials.bin");
const SAMPLE_CREDENTIALS_PATH = path.join(app.getAppPath(), "sample_credentials.json");

const setupIpcHandlers = () => {
  ipcMain.handle("read-nodes", handleReadNodes);
  ipcMain.handle("save-nodes", handleSaveNodes);
};

const readFile2String = (path: fs.PathOrFileDescriptor, encoding: BufferEncoding = "utf-8") => fs.readFileSync(path, encoding);
const readFile2Buffer = (path: fs.PathOrFileDescriptor) => fs.readFileSync(path);

const getSampleJsonData = () => JSON.parse(readFile2String(SAMPLE_CREDENTIALS_PATH));

const handleReadNodes = async () => {
  if (!safeStorage.isEncryptionAvailable()) {
    dialog.showMessageBox({
      type: "warning",
      message: "機密情報の復号処理で問題が発生しました。",
    });

    return getSampleJsonData();
  }

  try {
    const encrypted = readFile2Buffer(CREDENTIALS_PATH);
    const decrypted = safeStorage.decryptString(encrypted);
    return JSON.parse(decrypted);
  } catch (err) {
    console.log("Failed to read credentials from file: ", err);

    dialog.showMessageBox({
      type: "info",
      message: "パスワード情報が見つかりませんでしたので、代わりにサンプルデータを読み込みます。",
    });

    return getSampleJsonData();
  }
};

const handleSaveNodes = async (event: Electron.IpcMainInvokeEvent, data: TreeNode[]) => {
  const dialog = new QuestionDialog();
  dialog.showMessageBox("現在の内容で保存してもよろしいですか？", () => {
    const encrypted = safeStorage.encryptString(JSON.stringify(data));
    fs.writeFileSync(CREDENTIALS_PATH, new Uint8Array(encrypted));
    return true;
  });
};

export default setupIpcHandlers;
