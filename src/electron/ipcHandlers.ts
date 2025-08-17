import { app, dialog, ipcMain, safeStorage } from 'electron';
import * as fs from 'fs';
import path from 'path';

import { TreeNodePlain } from '../renderer/models/treeNode';
import {
  STORE_KEY_TREE_VIEW_EXPANDED_ITEMS,
  STORE_KEY_TREE_VIEW_SELECTED_ITEM_ID
} from '../shared/constants';
import { BackupSettings } from '../shared/types/BackupSettings';
import { isDevelopment } from '../shared/utils/environment';
import QuestionDialog from './dialogs/questionDialog';
import store from './store';

// 開発時はsrc/credentials/、本番時はdist/credentials/を使用
const getCredentialsPath = () => {
  if (isDevelopment()) {
    // 開発時: src/credentials/
    return path.join(process.cwd(), 'src', 'credentials', 'credentials.bin');
  } else {
    // 本番時: dist/credentials/
    return path.join(__dirname, 'credentials', 'credentials.bin');
  }
};

const getSampleCredentialsPath = () => {
  if (isDevelopment()) {
    // 開発時: src/credentials/
    return path.join(process.cwd(), 'src', 'credentials', 'sample_credentials.json');
  } else {
    // 本番時: dist/credentials/
    return path.join(__dirname, 'credentials', 'sample_credentials.json');
  }
};

const CREDENTIALS_PATH = getCredentialsPath();
const SAMPLE_CREDENTIALS_PATH = getSampleCredentialsPath();

const setupIpcHandlers = () => {
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

const getSampleJsonData = () => JSON.parse(readFile2String(SAMPLE_CREDENTIALS_PATH));

const questionDialog = new QuestionDialog();

const saveEncryptedData = (filePath: string, data: TreeNodePlain[]) => {
  // ディレクトリが存在しない場合は作成
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const encrypted = safeStorage.encryptString(JSON.stringify(data));
  fs.writeFileSync(filePath, new Uint8Array(encrypted));
};

const generateExportFilePath = (extension: string) => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fileName = `credentials_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.${extension}`;
  const backupPath = store.get('backupPath') as string;
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
      () => {
        saveEncryptedData(CREDENTIALS_PATH, data);
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
        .then(result => {
          if (result.canceled) return;
          if (result.filePath) saveEncryptedData(result.filePath, data);
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
        .then(result => {
          if (result.canceled) return;
          if (result.filePath) fs.writeFileSync(result.filePath, JSON.stringify(data));
        })
        .catch(err => exportErrorlog(err));
    }
  );
};

const handleGetSetting = (key: string) => store.get(key);

const handleUpdateSetting = (
  _: Electron.IpcMainInvokeEvent,
  key: keyof BackupSettings,
  value: string | boolean
) => store.set(key, value);

const handleGetBackupSettings = () => {
  return {
    backupEnabled: handleGetSetting('backupEnabled'),
    backupPath: handleGetSetting('backupPath')
  } as BackupSettings;
};

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
