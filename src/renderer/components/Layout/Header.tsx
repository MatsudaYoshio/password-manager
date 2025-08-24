import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SaveIcon from '@mui/icons-material/Save';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import useAddNewSubItem from '../../hooks/useAddNewSubItem';
import useAddNewTopItem from '../../hooks/useAddNewTopItem';
import useRemoveSubtree from '../../hooks/useRemoveSubtree';
import useSaveItems from '../../hooks/useSaveItems';

const Header = () => {
  const saveHandler = useSaveItems();
  const addNewTopItemHandler = useAddNewTopItem();
  const addNewSubItemHandler = useAddNewSubItem();
  const RemoveSubTreeHandler = useRemoveSubtree();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static' elevation={0} style={{ backgroundColor: '#e0e0e0' }}>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            <Stack direction='row' spacing={1}>
              <IconButton color='primary' onClick={saveHandler} aria-label='Save items'>
                <SaveIcon />
              </IconButton>
              <IconButton
                style={{ color: '#ff9800' }}
                onClick={addNewTopItemHandler}
                aria-label='Add new top item'
              >
                <CreateNewFolderIcon />
              </IconButton>
              <IconButton
                style={{ color: '#ffffff' }}
                onClick={addNewSubItemHandler}
                aria-label='Add new sub item'
              >
                <NoteAddIcon />
              </IconButton>
              <IconButton
                style={{ color: '#d50000' }}
                onClick={RemoveSubTreeHandler}
                aria-label='Delete item'
              >
                <DeleteForeverIcon />
              </IconButton>
            </Stack>
          </Typography>
        </Toolbar>
      </AppBar>
      <Box borderBottom={1} borderColor='grey.500' />
    </Box>
  );
};

export default Header;
