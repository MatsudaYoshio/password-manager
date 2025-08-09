import { useEffect } from 'react';
import useAddNewSubItem from './useAddNewSubItem';
import useAddNewTopItem from './useAddNewTopItem';
import useImportItems from './useImportItems';
import useRemoveSubtree from './useRemoveSubtree';
import useSaveItems from './useSaveItems';
import useExportItems from './useExportItems';

const useEventListeners = () => {
  const saveHandler = useSaveItems();
  const addTopItemHandler = useAddNewTopItem();
  const addSubItemHandler = useAddNewSubItem();
  const removeSubtreeHandler = useRemoveSubtree();
  const exportItemHandler = useExportItems();
  const importItems = useImportItems();

  const useSetupEventListener = (eventName: string, handler: () => void) =>
    useEffect(() => {
      const eventHandler = () => handler();
      (window as any).api[`on${eventName}`](eventHandler);
      return () => (window as any).api[`off${eventName}`](eventHandler);
    }, [handler]);

  useSetupEventListener('SaveData', saveHandler);
  useSetupEventListener('AddTopItem', addTopItemHandler);
  useSetupEventListener('AddSubItem', addSubItemHandler);
  useSetupEventListener('RemoveSubtree', removeSubtreeHandler);
  useSetupEventListener('ExportData', exportItemHandler);
};

export default useEventListeners;
