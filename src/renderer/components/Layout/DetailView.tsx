import AddBoxIcon from '@mui/icons-material/AddBox';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import * as React from 'react';
import { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Credential from '../../models/credential';
import TreeNode from '../../models/treeNode';
import { itemActions } from '../../store/item-slice';

const DetailView = () => {
  const dispatch = useDispatch();

  const activeNode = useSelector(
    (state: { item: { activeNode: TreeNode } }) => state.item.activeNode
  );

  const [title, setTitle] = React.useState(activeNode?.data?.title ?? '');
  const [credentials, setCredentials] = React.useState(activeNode?.data?.credentials ?? []);

  React.useEffect(() => {
    setTitle(activeNode?.data?.title ?? '');
    setCredentials(activeNode?.data?.credentials ?? []);
  }, [activeNode]);

  const mouseDownPasswordHandler = (event: React.MouseEvent<HTMLButtonElement>) =>
    event.preventDefault();

  const updateTitleHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    const updatedTreeNode = {
      id: activeNode.id,
      data: {
        title: event.target.value,
        credentials
      }
    };
    dispatch(itemActions.updateActiveNode(updatedTreeNode));
    dispatch(itemActions.updateItem(updatedTreeNode));
  };

  const updateNameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedCredentials = credentials.map(credential =>
      credential.id === event.target.id
        ? new Credential({ ...credential, name: event.target.value })
        : credential
    );
    setCredentials(updatedCredentials);
    dispatchNewCredential(updatedCredentials);
  };

  const updatePasswordHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedCredentials = credentials.map(credential =>
      credential.id === event.target.id
        ? new Credential({ ...credential, value: event.target.value })
        : credential
    );
    setCredentials(updatedCredentials);
    dispatchNewCredential(updatedCredentials);
  };

  const updateShowValueHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    const updatedCredentials = credentials.map(credential =>
      credential.id === event.currentTarget.id
        ? new Credential({ ...credential, showValue: !credential.showValue })
        : credential
    );
    setCredentials(updatedCredentials);
    dispatchNewCredential(updatedCredentials);
  };

  const dispatchNewCredential = (updatedCredentials: Credential[]) => {
    const newTreeNode = {
      id: activeNode.id,
      data: {
        title,
        credentials: updatedCredentials
      }
    };
    dispatch(itemActions.updateActiveNode(newTreeNode));
    dispatch(itemActions.updateItem(newTreeNode));
  };

  const addNewCredentialHandler = () => {
    const newTreeNode = {
      id: activeNode.id,
      data: {
        title,
        credentials: [...credentials, new Credential({})]
      }
    };
    dispatch(itemActions.updateActiveNode(newTreeNode));
    dispatch(itemActions.updateItem(newTreeNode));
  };

  const removeCredentialHandler = (id: string) => {
    const updatedTreeNode = {
      id: activeNode.id,
      data: {
        title,
        credentials: credentials.filter(credential => credential.id !== id)
      }
    };
    dispatch(itemActions.updateActiveNode(updatedTreeNode));
    dispatch(itemActions.updateItem(updatedTreeNode));
  };

  const showCredentials = () => {
    return credentials.map(credential => {
      return (
        <div key={credential.id}>
          <Box display='flex' alignItems='center' sx={{ flexGrow: 1 }}>
            <IconButton onClick={() => navigator.clipboard.writeText(credential.name)}>
              <ContentCopyIcon />
            </IconButton>
            <FormControl sx={{ m: 1, width: '25ch' }} variant='outlined'>
              <TextField
                id={credential.id}
                label='Name'
                variant='outlined'
                defaultValue={credential.name}
                onChange={updateNameHandler}
              />
            </FormControl>
            <IconButton onClick={() => navigator.clipboard.writeText(credential.value)}>
              <ContentCopyIcon />
            </IconButton>
            <FormControl sx={{ m: 1, width: '25ch' }} variant='outlined'>
              <InputLabel htmlFor='outlined-adornment-password'>Value</InputLabel>
              <OutlinedInput
                id={credential.id}
                type={credential.showValue ? 'text' : 'password'}
                defaultValue={credential.value}
                onChange={updatePasswordHandler}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      id={credential.id}
                      aria-label='toggle password visibility'
                      onClick={updateShowValueHandler}
                      onMouseDown={mouseDownPasswordHandler}
                      edge='end'
                    >
                      {credential.showValue ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label='value'
              />
            </FormControl>
            <IconButton
              color='error'
              onClick={() => removeCredentialHandler(credential.id)}
              aria-label='remove-credential'
            >
              <IndeterminateCheckBoxIcon />
            </IconButton>
          </Box>
        </div>
      );
    });
  };

  return (
    <Fragment>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          <TextField
            sx={{ m: 1, width: '50ch' }}
            fullWidth
            label='Title'
            color='secondary'
            focused
            id='fullWidth'
            value={title}
            onChange={updateTitleHandler}
          />
          <div>{showCredentials()}</div>
        </Typography>
      </Box>
      <Box display='flex' alignItems='left' justifyContent='left' sx={{ flexGrow: 1, ml: 40 }}>
        <IconButton color='primary' onClick={addNewCredentialHandler} aria-label='add-credential'>
          <AddBoxIcon />
        </IconButton>
      </Box>
    </Fragment>
  );
};

export default DetailView;
