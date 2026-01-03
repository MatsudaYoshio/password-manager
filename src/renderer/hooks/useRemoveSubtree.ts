import { useDispatch, useSelector } from 'react-redux';
import { itemActions } from '../store/item-slice';

import TreeNode from '../models/treeNode';

const useRemoveSubtree = () => {
  const dispatch = useDispatch();
  const activeNode = useSelector(
    (state: { item: { activeNode: TreeNode; itemData: TreeNode[] } }) => state.item.activeNode
  );
  return () => dispatch(itemActions.RemoveItemAndChildById(activeNode.id));
};

export default useRemoveSubtree;
