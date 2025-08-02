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

  const setupEventListener = (eventName: string, handler: () => void) =>
    useEffect(() => {
      const eventHandler = () => handler();
      (window as any).api[`on${eventName}`](eventHandler);
      return () => (window as any).api[`off${eventName}`](eventHandler);
    }, [handler]);

  setupEventListener('SaveData', saveHandler);
  setupEventListener('AddTopItem', addTopItemHandler);
  setupEventListener('AddSubItem', addSubItemHandler);
  setupEventListener('RemoveSubtree', removeSubtreeHandler);
  setupEventListener('ExportData', exportItemHandler);
};

export default useEventListeners;
