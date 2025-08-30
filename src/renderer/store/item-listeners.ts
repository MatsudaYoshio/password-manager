import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { itemActions } from './item-slice';

export const itemListeners = createListenerMiddleware();

// activeNodeの変更を監視して永続化
itemListeners.startListening({
  matcher: isAnyOf(
    itemActions.switchActiveNodeById,
    itemActions.updateActiveNode,
    itemActions.RemoveItemAndChildById,
    itemActions.addNewTopItem,
    itemActions.addNewSubItemById
  ),
  effect: async (_action, api) => {
    const state = api.getState() as RootState;
    try {
      await window.api?.saveTreeViewSelectedItemId(state.item.activeNode?.id ?? null);
    } catch (e) {
      console.warn('Failed to persist selected item id', e);
    }
  }
});

// expandedItemIdsの変更を監視して永続化
itemListeners.startListening({
  actionCreator: itemActions.setExpandedItemIds,
  effect: async action => {
    try {
      await window.api?.saveTreeViewExpandedItems(action.payload);
    } catch (e) {
      console.warn('Failed to persist expanded items', e);
    }
  }
});
