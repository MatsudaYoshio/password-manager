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
  ipcMain.handle("export-nodes", handleExportNodes);
};

const readFile2String = (path: fs.PathOrFileDescriptor, encoding: BufferEncoding = "utf-8") => fs.readFileSync(path, encoding);
const readFile2Buffer = (path: fs.PathOrFileDescriptor) => fs.readFileSync(path);

const getSampleJsonData = () => JSON.parse(readFile2String(SAMPLE_CREDENTIALS_PATH));

const questionDialog = new QuestionDialog();

const saveEncryptedData = (path: string, data: TreeNode[]) => {
  const encrypted = safeStorage.encryptString(JSON.stringify(data));
  fs.writeFileSync(path, new Uint8Array(encrypted));
};

const exportErrorlog = (err: any) => {
  console.log("[Error Log]", err);
  dialog.showMessageBox({
    type: "warning",
    message: "エクスポートに失敗しました。",
  });
};

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
      message: "機密情報が見つかりませんでしたので、代わりにサンプルデータを読み込みます。",
    });

    return getSampleJsonData();
  }
};

const handleSaveNodes = async (event: Electron.IpcMainInvokeEvent, data: TreeNode[]) => {
  questionDialog.showMessageBox("現在の内容で保存してもよろしいですか？", () => saveEncryptedData(CREDENTIALS_PATH, data));
};

const handleExportNodes = async (event: Electron.IpcMainInvokeEvent, data: TreeNode[]) => {
  questionDialog.showMessageBox(
    "機密情報を暗号化した状態で保存しますか？",
    () => {
      dialog
        .showSaveDialog({
          title: "エクスポート先のファイルの選択",
          defaultPath: "credentials.bin",
          filters: [
            {
              name: "バイナリファイル",
              extensions: ["bin"],
            },
          ],
        })
        .then((result) => {
          if (result.canceled) return;
          if (result.filePath) saveEncryptedData(result.filePath, data);
        })
        .catch((err) => exportErrorlog(err));
    },
    () => {
      dialog
        .showSaveDialog({
          title: "エクスポート先のファイルの選択",
          defaultPath: "credentials.json",
          filters: [
            {
              name: "JSONファイル",
              extensions: ["json"],
            },
          ],
        })
        .then((result) => {
          if (result.canceled) return;
          if (result.filePath) fs.writeFileSync(result.filePath, JSON.stringify(data));
        })
        .catch((err) => exportErrorlog(err));
    }
  );
};

export default setupIpcHandlers;
