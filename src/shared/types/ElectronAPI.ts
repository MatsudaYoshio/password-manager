import { BackupSettings } from './BackupSettings';
import { TreeNodePlain } from '../../renderer/models/treeNode';
import { VoidCallback, DataCallback } from './Callback';

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
  onSaveData(callback: VoidCallback): VoidCallback;
  offSaveData(handler: VoidCallback): void;
  onAddTopItem(callback: VoidCallback): VoidCallback;
  offAddTopItem(handler: VoidCallback): void;
  onAddSubItem(callback: VoidCallback): VoidCallback;
  offAddSubItem(handler: VoidCallback): void;
  onRemoveSubtree(callback: VoidCallback): VoidCallback;
  offRemoveSubtree(handler: VoidCallback): void;
  onExportData(callback: VoidCallback): VoidCallback;
  offExportData(handler: VoidCallback): void;
}
