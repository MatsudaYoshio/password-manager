import { useSelector } from 'react-redux';

import { stagingItemData } from '../store/item-slice';

const useExportItems = () => {
  const itemData = useSelector(stagingItemData);
  return async () => await (window as any).api.exportNodes(itemData);
};

export default useExportItems;
