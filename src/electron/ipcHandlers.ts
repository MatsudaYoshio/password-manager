import { app, dialog, ipcMain, safeStorage } from "electron";
import * as fs from "fs";
import path from "path";

import QuestionDialog from "./dialogs/questionDialog";
import TreeNode from "../renderer/models/treeNode";
import store from "./store";
import { BackupSettings } from "../shared/types/BackupSettings";

const CREDENTIALS_PATH = path.join(app.getAppPath(), "src", "credentials", "credentials.bin");
const SAMPLE_CREDENTIALS_PATH = path.join(app.getAppPath(), "src", "credentials", "sample_credentials.json");

const setupIpcHandlers = () => {
  ipcMain.handle("read-nodes", handleReadNodes);
  ipcMain.handle("save-nodes", handleSaveNodes);
  ipcMain.handle("export-nodes", handleExportNodes);
  ipcMain.handle("get-backup-settings", handleGetBackupSettings);
  ipcMain.handle("update-setting", handleUpdateSetting);
  ipcMain.handle("select-backup-path", handleSelectBackupPath);
};

const readFile2String = (path: fs.PathOrFileDescriptor, encoding: BufferEncoding = "utf-8") => fs.readFileSync(path, encoding);
const readFile2Buffer = (path: fs.PathOrFileDescriptor) => fs.readFileSync(path);

const getSampleJsonData = () => JSON.parse(readFile2String(SAMPLE_CREDENTIALS_PATH));

const questionDialog = new QuestionDialog();

const saveEncryptedData = (path: string, data: TreeNode[]) => {
  const encrypted = safeStorage.encryptString(JSON.stringify(data));
  fs.writeFileSync(path, new Uint8Array(encrypted));
};

const generateExportFilePath = (extension: string) => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const fileName = `credentials_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.${extension}`;
  const backupPath = store.get("backupPath") as string;
  if (backupPath) {
    return path.join(backupPath, fileName);
  }
  return path.join(app.getPath("desktop"), fileName);
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
          defaultPath: generateExportFilePath("bin"),
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
          defaultPath: generateExportFilePath("json"),
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

const handleGetSetting = (key: string) => store.get(key);

const handleUpdateSetting = (event: Electron.IpcMainInvokeEvent, key: string, value: any) => store.set(key, value);

const handleGetBackupSettings = () => {
  return {
    backupEnabled: handleGetSetting("backupEnabled"),
    backupPath: handleGetSetting("backupPath"),
  } as BackupSettings;
};

const handleSelectBackupPath = async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.filePaths[0] || null;
};

export default setupIpcHandlers;
