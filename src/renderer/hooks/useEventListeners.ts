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
    const saveHandlerRef = window.api.onSaveData(() => saveHandler());
    const addTopHandlerRef = window.api.onAddTopItem(() => addTopItemHandler());
    const addSubHandlerRef = window.api.onAddSubItem(() => addSubItemHandler());
    const removeSubtreeHandlerRef = window.api.onRemoveSubtree(() => removeSubtreeHandler());
    const exportHandlerRef = window.api.onExportData(() => exportItemHandler());

    // クリーンアップ関数
    return () => {
      window.api.offSaveData(saveHandlerRef);
      window.api.offAddTopItem(addTopHandlerRef);
      window.api.offAddSubItem(addSubHandlerRef);
      window.api.offRemoveSubtree(removeSubtreeHandlerRef);
      window.api.offExportData(exportHandlerRef);
    };
  }, [saveHandler, addTopItemHandler, addSubItemHandler, removeSubtreeHandler, exportItemHandler]);
};

export default useEventListeners;
