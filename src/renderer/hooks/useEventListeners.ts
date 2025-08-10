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

  // イベントリスナーの設定をまとめて管理
  useEffect(() => {
    // コールバック関数の参照を保持
    const saveCallback = () => saveHandler();
    const addTopCallback = () => addTopItemHandler();
    const addSubCallback = () => addSubItemHandler();
    const removeSubtreeCallback = () => removeSubtreeHandler();
    const exportCallback = () => exportItemHandler();

    // イベントリスナーを設定
    window.api.onSaveData(saveCallback);
    window.api.onAddTopItem(addTopCallback);
    window.api.onAddSubItem(addSubCallback);
    window.api.onRemoveSubtree(removeSubtreeCallback);
    window.api.onExportData(exportCallback);

    // クリーンアップ関数
    return () => {
      window.api.offSaveData(saveCallback);
      window.api.offAddTopItem(addTopCallback);
      window.api.offAddSubItem(addSubCallback);
      window.api.offRemoveSubtree(removeSubtreeCallback);
      window.api.offExportData(exportCallback);
    };
  }, [saveHandler, addTopItemHandler, addSubItemHandler, removeSubtreeHandler, exportItemHandler]);
};

export default useEventListeners;
