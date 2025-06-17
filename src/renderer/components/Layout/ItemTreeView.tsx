import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import TreeNode from "../../models/treeNode";
import { itemActions, stagingItemData } from "../../store/item-slice";

const MinusSquare = (props: SvgIconProps) => (
  <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
    <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t-.294-.682v0q0-.401-.294-.682t-.669-.281z" />
  </SvgIcon>
);

const PlusSquare = (props: SvgIconProps) => (
  <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
    <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
  </SvgIcon>
);

const CloseSquare = (props: SvgIconProps) => (
  <SvgIcon className="close" fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
    <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
  </SvgIcon>
);

export default function ItemTreeView() {
  const dispatch = useDispatch();

  const items = useSelector(stagingItemData);
  const activeNode = useSelector((state: { item: { activeNode: TreeNode } }) => state.item.activeNode);

  const handleItemClick = useCallback(
    (_: React.SyntheticEvent, itemId: string) => {
      dispatch(itemActions.switchActiveNodeById(itemId));
    },
    [dispatch]
  );

  /**
   * This function maps each TreeNode to a TreeViewBaseItem by assigning the id and title.
   * If a TreeNode has children, it recursively converts them and assigns them to the children property.
   */
  const getTreeItemsFromData = (treeItems: TreeNode[]): TreeViewBaseItem[] => {
    return treeItems.map((treeItemData) => {
      const item: TreeViewBaseItem = {
        id: treeItemData.id,
        label: treeItemData.data.title,
      };

      if (treeItemData.children && treeItemData.children.length > 0) {
        item.children = getTreeItemsFromData(treeItemData.children);
      }
      return item;
    });
  };

  return (
    <RichTreeView
      aria-label="customized"
      items={getTreeItemsFromData(items)}
      defaultExpandedItems={["1"]}
      selectedItems={activeNode ? activeNode.id : undefined}
      onItemClick={handleItemClick}
      slots={{
        collapseIcon: MinusSquare,
        expandIcon: PlusSquare,
        endIcon: CloseSquare,
      }}
      sx={{
        // Replicate borderLeft for group items if possible
        // This might require more specific selectors if RichTreeView doesn't directly support this
        "& .MuiTreeItem-group": {
          marginLeft: 15,
          paddingLeft: 18,
          borderLeft: "1px dashed rgba(0, 0, 0, 0.4)", // Simplified for now
        },
        // Opacity for close icon (end icon)
        "& .MuiTreeItem-iconContainer .close": {
          opacity: 0.3,
        },
      }}
    />
  );
}
