import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AlarmIcon from "@mui/icons-material/Alarm";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { useDispatch, useSelector } from "react-redux";
import { itemActions } from "../../store/item-slice";
import TreeNode from "../../models/treeNode";

const Header = () => {
  const dispatch = useDispatch();
  const activeNode = useSelector((state: { item: { activeNode: TreeNode; itemData: TreeNode[] } }) => state.item.activeNode);

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
              <IconButton style={{ color: "#ff9800" }} onClick={addNewTopItemHandler}>
                <CreateNewFolderIcon />
              </IconButton>
              <IconButton style={{ color: "#ffffff" }} onClick={addNewSubItemHandler}>
                <NoteAddIcon />
              </IconButton>
              <IconButton style={{ color: "#d50000" }} onClick={RemoveItemAndChildHandler}>
                <DeleteForeverIcon />
              </IconButton>
              <IconButton color="secondary" aria-label="add an alarm">
                <AlarmIcon />
              </IconButton>
              <IconButton color="primary" aria-label="add to shopping cart">
                <AddShoppingCartIcon />
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
