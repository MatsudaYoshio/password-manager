import { app, dialog, ipcMain, safeStorage } from 'electron';
import * as fs from 'fs';
import path from 'path';

import { TreeNodePlain } from '../renderer/models/treeNode';
import {
  STORE_KEY_TREE_VIEW_EXPANDED_ITEMS,
  STORE_KEY_TREE_VIEW_SELECTED_ITEM_ID
} from '../shared/constants';
import { BackupSettings } from '../shared/types/BackupSettings';
import { isDevelopment } from './utils/environment';
import { getBackupSettings } from './utils/backupSettings';
import QuestionDialog from './dialogs/questionDialog';
import store from './store';

// 開発時はsrc/credentials/、本番時はユーザーデータディレクトリを使用
const getCredentialsFilePath = (filename: string) => {
  if (isDevelopment()) {
    // 開発時: src/credentials/
    return path.join(process.cwd(), 'src', 'credentials', filename);
  }
  // 本番時: AppData/PasswordManager/credentials/
  return path.join(app.getPath('userData'), 'credentials', filename);
};

// 初回起動時にサンプルファイルをコピーする
const initializeCredentialsFile = async () => {
  const credentialsPath = getCredentialsFilePath('credentials.bin');
  const samplePath = path.join(__dirname, 'credentials', 'sample_credentials.json');

  // credentials.bin が存在しない場合のみ初期化
  if (!fs.existsSync(credentialsPath)) {
    const dir = path.dirname(credentialsPath);
    await fs.promises.mkdir(dir, { recursive: true });

    // サンプルデータを暗号化して保存
    if (safeStorage.isEncryptionAvailable() && fs.existsSync(samplePath)) {
      try {
        const sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));
        const encrypted = safeStorage.encryptString(JSON.stringify(sampleData));
        await fs.promises.writeFile(credentialsPath, new Uint8Array(encrypted));
        console.log('Initialized credentials.bin from sample data');
      } catch (err) {
        console.error('Failed to initialize credentials.bin:', err);
      }
    }
  }
};

const CREDENTIALS_PATH = getCredentialsFilePath('credentials.bin');
const SAMPLE_CREDENTIALS_PATH = path.join(__dirname, 'credentials', 'sample_credentials.json');

const setupIpcHandlers = () => {
  // 初回起動時の初期化
  initializeCredentialsFile().catch(err => {
    console.error('Failed to initialize credentials:', err);
  });

  ipcMain.handle('read-nodes', handleReadNodes);
  ipcMain.handle('save-nodes', handleSaveNodes);
  ipcMain.handle('export-nodes', handleExportNodes);
  ipcMain.handle('get-backup-settings', handleGetBackupSettings);
  ipcMain.handle('update-setting', handleUpdateSetting);
  ipcMain.handle('select-backup-path', handleSelectBackupPath);
  ipcMain.handle('save-tree-view-expanded-items', handleSaveTreeViewExpandedItems);
  ipcMain.handle('get-tree-view-expanded-items', handleGetTreeViewExpandedItems);
  ipcMain.handle('save-tree-view-selected-item-id', handleSaveTreeViewSelectedItemId);
  ipcMain.handle('get-tree-view-selected-item-id', handleGetTreeViewSelectedItemId);
};

const readFile2String = (path: fs.PathOrFileDescriptor, encoding: BufferEncoding = 'utf-8') =>
  fs.readFileSync(path, encoding);
const readFile2Buffer = (path: fs.PathOrFileDescriptor) => fs.readFileSync(path);

const getSampleJsonData = () => {
  if (fs.existsSync(SAMPLE_CREDENTIALS_PATH)) {
    return JSON.parse(readFile2String(SAMPLE_CREDENTIALS_PATH));
  }
  // サンプルファイルが見つからない場合は空配列を返す
  return [];
};

const questionDialog = new QuestionDialog();

const saveEncryptedData = async (filePath: string, data: TreeNodePlain[]) => {
  // ディレクトリが存在しない場合は作成
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });

  if (!safeStorage.isEncryptionAvailable()) {
    dialog.showMessageBox({
      type: 'warning',
      message: '暗号化機能が利用できないため、保存に失敗しました。'
    });
    return;
  }

  try {
    const encrypted = safeStorage.encryptString(JSON.stringify(data));
    await fs.promises.writeFile(filePath, new Uint8Array(encrypted));
  } catch (err) {
    console.log('[Error Log]', err);
    dialog.showMessageBox({
      type: 'warning',
      message: '保存に失敗しました。'
    });
  }
};

const generateExportFilePath = (extension: string) => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fileName = `credentials_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.${extension}`;
  const { backupPath } = getBackupSettings();
  if (backupPath) {
    return path.join(backupPath, fileName);
  }
  return path.join(app.getPath('desktop'), fileName);
};

const exportErrorlog = (err: Error) => {
  console.log('[Error Log]', err);
  dialog.showMessageBox({
    type: 'warning',
    message: 'エクスポートに失敗しました。'
  });
};

const handleReadNodes = async () => {
  if (!safeStorage.isEncryptionAvailable()) {
    dialog.showMessageBox({
      type: 'warning',
      message: '機密情報の復号処理で問題が発生しました。'
    });

    return getSampleJsonData();
  }

  try {
    const encrypted = readFile2Buffer(CREDENTIALS_PATH);
    const decrypted = safeStorage.decryptString(encrypted);
    return JSON.parse(decrypted);
  } catch (err) {
    console.log('Failed to read credentials from file: ', err);

    dialog.showMessageBox({
      type: 'info',
      message: '機密情報が見つかりませんでしたので、代わりにサンプルデータを読み込みます。'
    });

    return getSampleJsonData();
  }
};

const handleSaveNodes = async (_: Electron.IpcMainInvokeEvent, data: TreeNodePlain[]) =>
  new Promise<boolean>(resolve => {
    questionDialog.showMessageBox(
      '現在の内容で保存してもよろしいですか？',
      async () => {
        await saveEncryptedData(CREDENTIALS_PATH, data);
        resolve(true);
      },
      () => resolve(false)
    );
  });

const handleExportNodes = async (event: Electron.IpcMainInvokeEvent, data: TreeNodePlain[]) => {
  questionDialog.showMessageBox(
    '機密情報を暗号化した状態で保存しますか？',
    () => {
      dialog
        .showSaveDialog({
          title: 'エクスポート先のファイルの選択',
          defaultPath: generateExportFilePath('bin'),
          filters: [
            {
              name: 'バイナリファイル',
              extensions: ['bin']
            }
          ]
        })
        .then(async result => {
          if (result.canceled) return;
          if (result.filePath) await saveEncryptedData(result.filePath, data);
        })
        .catch(err => exportErrorlog(err));
    },
    () => {
      dialog
        .showSaveDialog({
          title: 'エクスポート先のファイルの選択',
          defaultPath: generateExportFilePath('json'),
          filters: [
            {
              name: 'JSONファイル',
              extensions: ['json']
            }
          ]
        })
        .then(async result => {
          if (result.canceled) return;
          if (result.filePath) await fs.promises.writeFile(result.filePath, JSON.stringify(data));
        })
        .catch(err => exportErrorlog(err));
    }
  );
};

const handleUpdateSetting = (
  _: Electron.IpcMainInvokeEvent,
  key: keyof BackupSettings,
  value: string | boolean
) => store.set(key, value);

const handleGetBackupSettings = () => getBackupSettings();

const handleSelectBackupPath = async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
};

const handleSaveTreeViewExpandedItems = (
  _: Electron.IpcMainInvokeEvent,
  expandedItemIds: string[]
) => {
  store.set(STORE_KEY_TREE_VIEW_EXPANDED_ITEMS, expandedItemIds);
};

const handleGetTreeViewExpandedItems = (): string[] => {
  const items = store.get(STORE_KEY_TREE_VIEW_EXPANDED_ITEMS);
  return Array.isArray(items) ? items : [];
};

const handleSaveTreeViewSelectedItemId = (
  _: Electron.IpcMainInvokeEvent,
  selectedItemId: string | null | undefined
) => {
  if (selectedItemId == null) {
    store.delete(STORE_KEY_TREE_VIEW_SELECTED_ITEM_ID);
  } else {
    store.set(STORE_KEY_TREE_VIEW_SELECTED_ITEM_ID, selectedItemId);
  }
};

const handleGetTreeViewSelectedItemId = (): string | undefined => {
  // store.get は値がない場合 undefined を返すので、そのまま返す
  return store.get(STORE_KEY_TREE_VIEW_SELECTED_ITEM_ID) as string | undefined;
};

export default setupIpcHandlers;
