import { BackupSettings } from './BackupSettings';
import { TreeNodePlain } from '../../renderer/models/treeNode';
import { VoidCallback, DataCallback, IpcEventHandler } from './Callback';

export interface ElectronAPI {
  // Backup settings
  getBackupSettings(): Promise<BackupSettings>;
  updateSetting(key: keyof BackupSettings, value: string | boolean): Promise<void>;
  selectBackupPath(): Promise<string | null>;

  // Tree view operations
  readNodes(): Promise<TreeNodePlain[]>;
  saveNodes(nodes: TreeNodePlain[]): Promise<boolean>;
  exportNodes(nodes: TreeNodePlain[]): Promise<void>;
  onImportData(callback: DataCallback<TreeNodePlain[]>): void;
  getTreeViewExpandedItems(): Promise<string[]>;
  getTreeViewSelectedItemId(): Promise<string | undefined>;
  saveTreeViewSelectedItemId(itemId: string | null): Promise<void>;
  saveTreeViewExpandedItems(expandedItemIds: string[]): Promise<void>;

  // Event listeners
  onSaveData(callback: VoidCallback): IpcEventHandler;
  offSaveData(handler: IpcEventHandler): void;
  onAddTopItem(callback: VoidCallback): IpcEventHandler;
  offAddTopItem(handler: IpcEventHandler): void;
  onAddSubItem(callback: VoidCallback): IpcEventHandler;
  offAddSubItem(handler: IpcEventHandler): void;
  onRemoveSubtree(callback: VoidCallback): IpcEventHandler;
  offRemoveSubtree(handler: IpcEventHandler): void;
  onExportData(callback: VoidCallback): IpcEventHandler;
  offExportData(handler: IpcEventHandler): void;
}
