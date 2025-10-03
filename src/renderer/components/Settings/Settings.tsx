import React, { useCallback } from 'react';
import { Box, Checkbox, FormControlLabel, TextField, Button } from '@mui/material';
import { useBackupSettings } from './hooks/useBackupSettings';

const Settings: React.FC = () => {
  const { backupEnabled, backupPath, toggleBackupEnabled, selectBackupPath } = useBackupSettings();

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      toggleBackupEnabled(event.target.checked);
    },
    [toggleBackupEnabled]
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
        label='バックアップ先パス'
        variant='outlined'
        size='small'
        fullWidth
        slotProps={{
          input: {
            readOnly: true
          }
        }}
        sx={{ minWidth: 250 }}
      />
      <Button variant='contained' onClick={handleBrowseClick} aria-label='browse-backup-path'>
        参照
      </Button>
    </Box>
  );
};

export default Settings;
