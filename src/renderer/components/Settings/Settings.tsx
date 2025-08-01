import React, { useEffect, useState } from 'react';
import { BackupSettings } from '../../../shared/types/BackupSettings';
import { Box, Checkbox, FormControlLabel, TextField, Button } from '@mui/material';

const { api } = window as any;

const Settings: React.FC = () => {
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [backupPath, setBackupPath] = useState('');

  useEffect(() => {
    api.getBackupSettings().then((settings: BackupSettings) => {
      setBackupEnabled(settings.backupEnabled);
      setBackupPath(settings.backupPath);
    });
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setBackupEnabled(isChecked);
    api.updateSetting('backupEnabled', isChecked);
  };

  const handlePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const path = event.target.value;
    setBackupPath(path);
    api.updateSetting('backupPath', path);
  };

  const handleBrowseClick = async () => {
    const selectedPath = await api.selectBackupPath();
    if (selectedPath) {
      setBackupPath(selectedPath);
      api.updateSetting('backupPath', selectedPath);
    }
  };

  return (
    <Box display='flex' alignItems='center' gap={2}>
      <FormControlLabel
        control={
          <Checkbox checked={backupEnabled} onChange={handleCheckboxChange} color='primary' />
        }
        label='自動バックアップする'
      />
      <TextField
        value={backupPath}
        onChange={handlePathChange}
        label='バックアップ先パス'
        variant='outlined'
        size='small'
        fullWidth
        sx={{ minWidth: 250 }}
      />
      <Button variant='contained' onClick={handleBrowseClick}>
        参照
      </Button>
    </Box>
  );
};

export default Settings;
