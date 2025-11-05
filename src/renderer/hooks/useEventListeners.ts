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
    // イベントリスナーを設定し、ハンドラーの参照を保持
    const saveHandler_ref = window.api.onSaveData(() => saveHandler());
    const addTopHandler_ref = window.api.onAddTopItem(() => addTopItemHandler());
    const addSubHandler_ref = window.api.onAddSubItem(() => addSubItemHandler());
    const removeSubtreeHandler_ref = window.api.onRemoveSubtree(() => removeSubtreeHandler());
    const exportHandler_ref = window.api.onExportData(() => exportItemHandler());

    // クリーンアップ関数
    return () => {
      window.api.offSaveData(saveHandler_ref);
      window.api.offAddTopItem(addTopHandler_ref);
      window.api.offAddSubItem(addSubHandler_ref);
      window.api.offRemoveSubtree(removeSubtreeHandler_ref);
      window.api.offExportData(exportHandler_ref);
    };
  }, [saveHandler, addTopItemHandler, addSubItemHandler, removeSubtreeHandler, exportItemHandler]);
};

export default useEventListeners;
