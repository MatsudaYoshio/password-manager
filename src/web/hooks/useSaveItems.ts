import { useDispatch, useSelector } from "react-redux";

import { hasDifferenceBetweenMainAndStaging, itemActions, stagingItemData } from "../store/item-slice";

const useSaveItems = () => {
  const dispatch = useDispatch();
  const itemData = useSelector(stagingItemData);
  const hasDifference = useSelector(hasDifferenceBetweenMainAndStaging);

  return async () => {
    if (hasDifference) {
      const hasSaved = await (window as any).api.saveNodes(itemData);
      if (hasSaved) {
        dispatch(itemActions.updateMainState());
      }
    }
  };
};

export default useSaveItems;
