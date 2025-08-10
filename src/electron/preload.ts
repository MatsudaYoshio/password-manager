import { contextBridge, ipcRenderer } from 'electron';
import { TreeNodePlain } from '../renderer/models/treeNode';
import { ElectronAPI } from '../shared/types/ElectronAPI';

const api: ElectronAPI = {
  readNodes: () => ipcRenderer.invoke('read-nodes'),
  saveNodes: (nodes: TreeNodePlain[]) => ipcRenderer.invoke('save-nodes', nodes),
  exportNodes: (nodes: TreeNodePlain[]) => ipcRenderer.invoke('export-nodes', nodes),
  onImportData: (callback: (data: TreeNodePlain[]) => void) =>
    ipcRenderer.on('import-data', (_event, parsedObject) => callback(parsedObject)),

  onSaveData: (callback: () => void) => ipcRenderer.once('save-data', () => callback()),
  offSaveData: (callback: () => void) => ipcRenderer.removeListener('save-data', callback),

  onAddTopItem: (callback: () => void) => ipcRenderer.once('add-top-item', () => callback()),
  offAddTopItem: (callback: () => void) => ipcRenderer.removeListener('add-top-item', callback),

  onAddSubItem: (callback: () => void) => ipcRenderer.once('add-sub-item', () => callback()),
  offAddSubItem: (callback: () => void) => ipcRenderer.removeListener('add-sub-item', callback),

  onRemoveSubtree: (callback: () => void) => ipcRenderer.once('remove-subtree', () => callback()),
  offRemoveSubtree: (callback: () => void) =>
    ipcRenderer.removeListener('remove-subtree', callback),

  onExportData: (callback: () => void) => ipcRenderer.on('export-data', () => callback()),
  offExportData: (callback: () => void) => ipcRenderer.removeListener('export-data', callback),

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
