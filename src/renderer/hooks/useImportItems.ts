import { plainToInstance } from "class-transformer";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import TreeNode from "../models/treeNode";
import { itemActions } from "../store/item-slice";

const useImportItems = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (window as any).api.onImportData((parsedObject: any) => dispatch(itemActions.updateStagingData(plainToInstance(TreeNode, parsedObject))));
  }, []);
};

export default useImportItems;
