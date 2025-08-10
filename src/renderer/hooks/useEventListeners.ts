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

  // Import items hook is called for its side effects (sets up onImportData listener)
  useImportItems();

  useEffect(() => {
    const eventHandler = () => saveHandler();
    window.api.onSaveData(eventHandler);
    return () => window.api.offSaveData(eventHandler);
  }, [saveHandler]);

  useEffect(() => {
    const eventHandler = () => addTopItemHandler();
    window.api.onAddTopItem(eventHandler);
    return () => window.api.offAddTopItem(eventHandler);
  }, [addTopItemHandler]);

  useEffect(() => {
    const eventHandler = () => addSubItemHandler();
    window.api.onAddSubItem(eventHandler);
    return () => window.api.offAddSubItem(eventHandler);
  }, [addSubItemHandler]);

  useEffect(() => {
    const eventHandler = () => removeSubtreeHandler();
    window.api.onRemoveSubtree(eventHandler);
    return () => window.api.offRemoveSubtree(eventHandler);
  }, [removeSubtreeHandler]);

  useEffect(() => {
    const eventHandler = () => exportItemHandler();
    window.api.onExportData(eventHandler);
    return () => window.api.offExportData(eventHandler);
  }, [exportItemHandler]);
};

export default useEventListeners;
