import { contextBridge, ipcRenderer } from 'electron';
import { TreeNodePlain } from '../renderer/models/treeNode';
import { ElectronAPI } from '../shared/types/ElectronAPI';
import { BackupSettings } from '../shared/types/BackupSettings';
import { VoidCallback, DataCallback } from '../shared/types/Callback';

const api: ElectronAPI = {
  readNodes: () => ipcRenderer.invoke('read-nodes'),
  saveNodes: (nodes: TreeNodePlain[]) => ipcRenderer.invoke('save-nodes', nodes),
  exportNodes: (nodes: TreeNodePlain[]) => ipcRenderer.invoke('export-nodes', nodes),
  onImportData: (callback: DataCallback<TreeNodePlain[]>) =>
    ipcRenderer.on('import-data', (_event, parsedObject) => callback(parsedObject)),

  onSaveData: (callback: VoidCallback) => {
    const handler = () => callback();
    ipcRenderer.on('save-data', handler);
    return handler;
  },
  offSaveData: (handler: VoidCallback) => ipcRenderer.removeListener('save-data', handler),

  onAddTopItem: (callback: VoidCallback) => {
    const handler = () => callback();
    ipcRenderer.on('add-top-item', handler);
    return handler;
  },
  offAddTopItem: (handler: VoidCallback) => ipcRenderer.removeListener('add-top-item', handler),

  onAddSubItem: (callback: VoidCallback) => {
    const handler = () => callback();
    ipcRenderer.on('add-sub-item', handler);
    return handler;
  },
  offAddSubItem: (handler: VoidCallback) => ipcRenderer.removeListener('add-sub-item', handler),

  onRemoveSubtree: (callback: VoidCallback) => {
    const handler = () => callback();
    ipcRenderer.on('remove-subtree', handler);
    return handler;
  },
  offRemoveSubtree: (handler: VoidCallback) =>
    ipcRenderer.removeListener('remove-subtree', handler),

  onExportData: (callback: VoidCallback) => {
    const handler = () => callback();
    ipcRenderer.on('export-data', handler);
    return handler;
  },
  offExportData: (handler: VoidCallback) => ipcRenderer.removeListener('export-data', handler),

  getBackupSettings: () => ipcRenderer.invoke('get-backup-settings'),
  updateSetting: (key: keyof BackupSettings, value: string | boolean) =>
    ipcRenderer.invoke('update-setting', key, value),
  selectBackupPath: () => ipcRenderer.invoke('select-backup-path'),

  // TreeView state
  saveTreeViewExpandedItems: (expandedItemIds: string[]) =>
    ipcRenderer.invoke('save-tree-view-expanded-items', expandedItemIds),
  getTreeViewExpandedItems: () => ipcRenderer.invoke('get-tree-view-expanded-items'),
  saveTreeViewSelectedItemId: (selectedItemId: string | null) =>
    ipcRenderer.invoke('save-tree-view-selected-item-id', selectedItemId),
  getTreeViewSelectedItemId: () => ipcRenderer.invoke('get-tree-view-selected-item-id')
};

contextBridge.exposeInMainWorld('api', api);
