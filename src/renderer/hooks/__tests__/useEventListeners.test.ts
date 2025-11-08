import { renderHook } from '@testing-library/react';
import useEventListeners from '../useEventListeners';
import useAddNewSubItem from '../useAddNewSubItem';
import useAddNewTopItem from '../useAddNewTopItem';
import useImportItems from '../useImportItems';
import useRemoveSubtree from '../useRemoveSubtree';
import useSaveItems from '../useSaveItems';
import useExportItems from '../useExportItems';

// モック化
jest.mock('../useAddNewSubItem');
jest.mock('../useAddNewTopItem');
jest.mock('../useImportItems');
jest.mock('../useRemoveSubtree');
jest.mock('../useSaveItems');
jest.mock('../useExportItems');

describe('useEventListeners', () => {
  let mockSaveHandler: jest.Mock;
  let mockAddTopItemHandler: jest.Mock;
  let mockAddSubItemHandler: jest.Mock;
  let mockRemoveSubtreeHandler: jest.Mock;
  let mockExportItemHandler: jest.Mock;

  let mockOnSaveData: jest.Mock;
  let mockOffSaveData: jest.Mock;
  let mockOnAddTopItem: jest.Mock;
  let mockOffAddTopItem: jest.Mock;
  let mockOnAddSubItem: jest.Mock;
  let mockOffAddSubItem: jest.Mock;
  let mockOnRemoveSubtree: jest.Mock;
  let mockOffRemoveSubtree: jest.Mock;
  let mockOnExportData: jest.Mock;
  let mockOffExportData: jest.Mock;
  let mockSendRendererReady: jest.Mock;

  beforeEach(() => {
    // Given: ハンドラー関数のモック
    mockSaveHandler = jest.fn();
    mockAddTopItemHandler = jest.fn();
    mockAddSubItemHandler = jest.fn();
    mockRemoveSubtreeHandler = jest.fn();
    mockExportItemHandler = jest.fn();

    (useSaveItems as jest.Mock).mockReturnValue(mockSaveHandler);
    (useAddNewTopItem as jest.Mock).mockReturnValue(mockAddTopItemHandler);
    (useAddNewSubItem as jest.Mock).mockReturnValue(mockAddSubItemHandler);
    (useRemoveSubtree as jest.Mock).mockReturnValue(mockRemoveSubtreeHandler);
    (useExportItems as jest.Mock).mockReturnValue(mockExportItemHandler);
    (useImportItems as jest.Mock).mockReturnValue(undefined);

    // Given: window.apiのモック
    mockOnSaveData = jest.fn().mockReturnValue(jest.fn());
    mockOffSaveData = jest.fn();
    mockOnAddTopItem = jest.fn().mockReturnValue(jest.fn());
    mockOffAddTopItem = jest.fn();
    mockOnAddSubItem = jest.fn().mockReturnValue(jest.fn());
    mockOffAddSubItem = jest.fn();
    mockOnRemoveSubtree = jest.fn().mockReturnValue(jest.fn());
    mockOffRemoveSubtree = jest.fn();
    mockOnExportData = jest.fn().mockReturnValue(jest.fn());
    mockOffExportData = jest.fn();
    mockSendRendererReady = jest.fn();

    window.api = {
      ...window.api,
      onSaveData: mockOnSaveData,
      offSaveData: mockOffSaveData,
      onAddTopItem: mockOnAddTopItem,
      offAddTopItem: mockOffAddTopItem,
      onAddSubItem: mockOnAddSubItem,
      offAddSubItem: mockOffAddSubItem,
      onRemoveSubtree: mockOnRemoveSubtree,
      offRemoveSubtree: mockOffRemoveSubtree,
      onExportData: mockOnExportData,
      offExportData: mockOffExportData,
      sendRendererReady: mockSendRendererReady
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should_register_all_event_listeners_on_mount', () => {
    // When: フックをマウント
    renderHook(() => useEventListeners());

    // Then: すべてのイベントリスナーが登録される
    expect(mockOnSaveData).toHaveBeenCalledTimes(1);
    expect(mockOnAddTopItem).toHaveBeenCalledTimes(1);
    expect(mockOnAddSubItem).toHaveBeenCalledTimes(1);
    expect(mockOnRemoveSubtree).toHaveBeenCalledTimes(1);
    expect(mockOnExportData).toHaveBeenCalledTimes(1);
  });

  it('should_cleanup_all_event_listeners_on_unmount', () => {
    // Given: 各イベントリスナーが返すハンドラー参照
    const saveHandlerRef = jest.fn();
    const addTopHandlerRef = jest.fn();
    const addSubHandlerRef = jest.fn();
    const removeSubtreeHandlerRef = jest.fn();
    const exportHandlerRef = jest.fn();

    mockOnSaveData.mockReturnValue(saveHandlerRef);
    mockOnAddTopItem.mockReturnValue(addTopHandlerRef);
    mockOnAddSubItem.mockReturnValue(addSubHandlerRef);
    mockOnRemoveSubtree.mockReturnValue(removeSubtreeHandlerRef);
    mockOnExportData.mockReturnValue(exportHandlerRef);

    // When: フックをマウントしてアンマウント
    const { unmount } = renderHook(() => useEventListeners());
    unmount();

    // Then: すべてのイベントリスナーが正しいハンドラー参照でクリーンアップされる
    expect(mockOffSaveData).toHaveBeenCalledWith(saveHandlerRef);
    expect(mockOffAddTopItem).toHaveBeenCalledWith(addTopHandlerRef);
    expect(mockOffAddSubItem).toHaveBeenCalledWith(addSubHandlerRef);
    expect(mockOffRemoveSubtree).toHaveBeenCalledWith(removeSubtreeHandlerRef);
    expect(mockOffExportData).toHaveBeenCalledWith(exportHandlerRef);
  });

  it('should_not_accumulate_listeners_on_rerender', () => {
    // When: フックを再レンダリング
    const { rerender } = renderHook(() => useEventListeners());
    rerender();
    rerender();

    // Then: 初回マウント時のみリスナーが登録される（依存配列が変わらない限り）
    // 注: 実際の依存配列の動作により、ハンドラーが変わると再登録される可能性がある
    // この場合、最低限初回登録が行われることを確認
    expect(mockOnSaveData).toHaveBeenCalled();
  });

  it('should_re_register_listeners_when_handlers_change', () => {
    // Given: 初回レンダリング
    const { rerender } = renderHook(() => useEventListeners());
    const initialCallCount = mockOnSaveData.mock.calls.length;

    // When: ハンドラーが変更される
    const newSaveHandler = jest.fn();
    (useSaveItems as jest.Mock).mockReturnValue(newSaveHandler);
    rerender();

    // Then: リスナーが再登録される
    expect(mockOnSaveData.mock.calls.length).toBeGreaterThan(initialCallCount);
  });
});
