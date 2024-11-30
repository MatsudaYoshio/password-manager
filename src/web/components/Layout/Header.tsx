import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SaveIcon from "@mui/icons-material/Save";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { useDispatch, useSelector } from "react-redux";

import TreeNode from "../../models/treeNode";
import { hasDifferenceBetweenMainAndStaging, itemActions, stagingItemData } from "../../store/item-slice";

const Header = () => {
  const dispatch = useDispatch();
  const activeNode = useSelector((state: { item: { activeNode: TreeNode; itemData: TreeNode[] } }) => state.item.activeNode);
  const itemData = useSelector(stagingItemData);
  const hasDifference = useSelector(hasDifferenceBetweenMainAndStaging);

  const saveHandler = () => {
    if (hasDifference) {
      dispatch(itemActions.updateMainState());
      (window as any).api.saveNodes(itemData);
    }
  };

  const addNewTopItemHandler = () => {
    dispatch(itemActions.addNewTopItem());
  };

  const addNewSubItemHandler = () => {
    dispatch(itemActions.addNewSubItemById(activeNode.id));
  };

  const RemoveItemAndChildHandler = () => {
    dispatch(itemActions.RemoveItemAndChildById(activeNode.id));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0} style={{ backgroundColor: "#e0e0e0" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1}>
              <IconButton color="primary" onClick={saveHandler}>
                <SaveIcon />
              </IconButton>
              <IconButton style={{ color: "#ff9800" }} onClick={addNewTopItemHandler}>
                <CreateNewFolderIcon />
              </IconButton>
              <IconButton style={{ color: "#ffffff" }} onClick={addNewSubItemHandler}>
                <NoteAddIcon />
              </IconButton>
              <IconButton style={{ color: "#d50000" }} onClick={RemoveItemAndChildHandler}>
                <DeleteForeverIcon />
              </IconButton>
            </Stack>
          </Typography>
        </Toolbar>
      </AppBar>
      <Box borderBottom={1} borderColor="grey.500" />
    </Box>
  );
};

export default Header;
