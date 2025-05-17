import React, { useEffect, useState } from "react";
import { BackupSettings } from "../../../shared/types/BackupSettings";

const { api } = window as any;

const Settings: React.FC = () => {
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [backupPath, setBackupPath] = useState("");

  // 初期値をElectron Storeから取得
  useEffect(() => {
    api.getBackupSettings().then((settings: BackupSettings) => {
      setBackupEnabled(settings.backupEnabled);
      setBackupPath(settings.backupPath);
    });
  }, []);

  // チェックボックスの状態を更新
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setBackupEnabled(isChecked);
    api.updateSetting("backupEnabled", isChecked);
  };

  // パスの変更を更新
  const handlePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const path = event.target.value;
    setBackupPath(path);
    api.updateSetting("backupPath", path);
  };

  // パスを選択するダイアログを開く
  const handleBrowseClick = async () => {
    const selectedPath = await api.selectBackupPath();
    if (selectedPath) {
      setBackupPath(selectedPath);
      api.updateSetting("backupPath", selectedPath);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <input type="checkbox" checked={backupEnabled} onChange={handleCheckboxChange} />
      <label>自動バックアップする</label>
      <input type="text" value={backupPath} onChange={handlePathChange} style={{ flex: 1 }} />
      <button onClick={handleBrowseClick}>参照...</button>
    </div>
  );
};

export default Settings;
