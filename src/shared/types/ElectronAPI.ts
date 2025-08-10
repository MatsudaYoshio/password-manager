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
  saveTreeViewSelectedItemId(itemId: string | null): void;
  saveTreeViewExpandedItems(expandedItemIds: string[]): void;

  // Event listeners
  onSaveData(callback: VoidCallback): void;
  offSaveData(callback: VoidCallback): void;
  onAddTopItem(callback: VoidCallback): void;
  offAddTopItem(callback: VoidCallback): void;
  onAddSubItem(callback: VoidCallback): void;
  offAddSubItem(callback: VoidCallback): void;
  onRemoveSubtree(callback: VoidCallback): void;
  offRemoveSubtree(callback: VoidCallback): void;
  onExportData(callback: VoidCallback): void;
  offExportData(callback: VoidCallback): void;
}
