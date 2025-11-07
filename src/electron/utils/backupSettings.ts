import store from '../store';
import { BackupSettings } from '../../shared/types/BackupSettings';

/**
 * バックアップ設定を取得する共通関数
 */
export const getBackupSettings = (): BackupSettings => {
  return {
    backupEnabled: store.get('backupEnabled', false) as boolean,
    backupPath: store.get('backupPath') as string
  };
};
