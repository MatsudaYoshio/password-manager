import { useState, useEffect, useCallback } from 'react';
import { BackupSettings } from '../../../../shared/types/BackupSettings';

export const useBackupSettings = () => {
  const [backupEnabled, setBackupEnabled] = useState<boolean>(false);
  const [backupPath, setBackupPath] = useState<string>('');

  // API呼び出しの共通ヘルパー
  const getApi = useCallback(() => {
    const { api } = window;
    return api;
  }, []);

  // エラーハンドリングの共通ヘルパー
  const handleError = useCallback((operation: string, error: unknown) => {
    console.error(`Failed to ${operation}:`, error);
  }, []);

  // 設定更新の共通ヘルパー
  const updateSetting = useCallback(
    async (key: keyof BackupSettings, value: boolean | string) => {
      const api = getApi();
      if (api?.updateSetting) {
        try {
          await api.updateSetting(key, value);
        } catch (error) {
          handleError(`update ${key} setting`, error);
        }
      }
    },
    [getApi, handleError]
  );

  // 初期設定の読み込み
  useEffect(() => {
    const loadSettings = async () => {
      const api = getApi();
      if (api?.getBackupSettings) {
        try {
          const settings: BackupSettings = await api.getBackupSettings();
          setBackupEnabled(settings.backupEnabled);
          setBackupPath(settings.backupPath);
        } catch (error) {
          handleError('get backup settings', error);
        }
      }
    };

    loadSettings();
  }, [getApi, handleError]);

  // バックアップ有効/無効の切り替え
  const toggleBackupEnabled = useCallback(
    (enabled: boolean) => {
      setBackupEnabled(enabled);
      updateSetting('backupEnabled', enabled);
    },
    [updateSetting]
  );

  // バックアップパスの更新
  const updateBackupPath = useCallback(
    (path: string) => {
      setBackupPath(path);
      updateSetting('backupPath', path);
    },
    [updateSetting]
  );

  // パス選択ダイアログの表示
  const selectBackupPath = useCallback(async () => {
    const api = getApi();
    if (api?.selectBackupPath) {
      try {
        const selectedPath = await api.selectBackupPath();
        if (selectedPath) {
          setBackupPath(selectedPath);
          await updateSetting('backupPath', selectedPath);
        }
      } catch (error) {
        handleError('select backup path', error);
      }
    }
  }, [getApi, handleError, updateSetting]);

  return {
    backupEnabled,
    backupPath,
    toggleBackupEnabled,
    updateBackupPath,
    selectBackupPath
  };
};
