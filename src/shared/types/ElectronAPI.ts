import { BackupSettings } from './BackupSettings';
import { TreeNodePlain } from '../../renderer/models/treeNode';

export interface ElectronAPI {
  // Backup settings
  getBackupSettings(): Promise<BackupSettings>;
  updateSetting(key: keyof BackupSettings, value: string | boolean): Promise<void>;
  selectBackupPath(): Promise<string | null>;

  // Tree view operations
  readNodes(): Promise<TreeNodePlain[]>;
  saveNodes(nodes: TreeNodePlain[]): Promise<boolean>;
  exportNodes(nodes: TreeNodePlain[]): Promise<void>;
  onImportData(callback: (data: TreeNodePlain[]) => void): void;
  getTreeViewExpandedItems(): Promise<string[]>;
  getTreeViewSelectedItemId(): Promise<string | undefined>;
  saveTreeViewSelectedItemId(itemId: string | null): void;
  saveTreeViewExpandedItems(expandedItemIds: string[]): void;

  // Event listeners
  onSaveData(callback: () => void): void;
  offSaveData(callback: () => void): void;
  onAddTopItem(callback: () => void): void;
  offAddTopItem(callback: () => void): void;
  onAddSubItem(callback: () => void): void;
  offAddSubItem(callback: () => void): void;
  onRemoveSubtree(callback: () => void): void;
  offRemoveSubtree(callback: () => void): void;
  onExportData(callback: () => void): void;
  offExportData(callback: () => void): void;
}
