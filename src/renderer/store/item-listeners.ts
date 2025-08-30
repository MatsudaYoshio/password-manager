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
    if (window.api) {
      window.api.saveTreeViewSelectedItemId(state.item.activeNode?.id ?? null);
    }
  }
});

// expandedItemIdsの変更を監視して永続化
itemListeners.startListening({
  actionCreator: itemActions.setExpandedItemIds,
  effect: async action => {
    if (window.api) {
      window.api.saveTreeViewExpandedItems(action.payload);
    }
  }
});
