import { plainToInstance } from 'class-transformer';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import TreeNode, { TreeNodePlain } from '../models/treeNode';
import { itemActions } from '../store/item-slice';

const useImportItems = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    window.api.onImportData((parsedObject: TreeNodePlain[]) =>
      dispatch(itemActions.updateStagingData(plainToInstance(TreeNode, parsedObject)))
    );
  }, [dispatch]);
};

export default useImportItems;
