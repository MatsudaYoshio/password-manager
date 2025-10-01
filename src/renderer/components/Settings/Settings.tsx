import React, { useCallback } from 'react';
import { Box, Checkbox, FormControlLabel, TextField, Button } from '@mui/material';
import { useBackupSettings } from './hooks/useBackupSettings';

const Settings: React.FC = () => {
  const { backupEnabled, backupPath, toggleBackupEnabled, updateBackupPath, selectBackupPath } =
    useBackupSettings();

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      toggleBackupEnabled(event.target.checked);
    },
    [toggleBackupEnabled]
  );

  const handlePathChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateBackupPath(event.target.value);
    },
    [updateBackupPath]
  );

  const handleBrowseClick = useCallback(async () => {
    await selectBackupPath();
  }, [selectBackupPath]);

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
      <Button variant='contained' onClick={handleBrowseClick} aria-label='browse-backup-path'>
        参照
      </Button>
    </Box>
  );
};

export default Settings;
